"""
AI-powered conversation analysis module.
Provides summarization, semantic search, sentiment analysis, and topic extraction.
"""
import os
from typing import List, Dict, Optional, Tuple
from datetime import datetime

from django.conf import settings
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage, AIMessage

# Try to import sentence transformers for embeddings, fallback if not available
EMBEDDINGS_AVAILABLE = False
try:
    from sentence_transformers import SentenceTransformer
    EMBEDDINGS_AVAILABLE = True
except (ImportError, ValueError, Exception) as e:
    EMBEDDINGS_AVAILABLE = False
    print(f"Warning: sentence-transformers not available ({str(e)}). Semantic search will use keyword matching.")


class ConversationAnalyzer:
    """Handles AI-powered conversation analysis and intelligence."""

    def __init__(self):
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=2000,
        )
        self.embeddings_model = None
        if EMBEDDINGS_AVAILABLE:
            try:
                self.embeddings_model = SentenceTransformer('all-MiniLM-L6-v2')
            except Exception as e:
                print(f"Warning: Could not load embeddings model: {e}")
                self.embeddings_model = None

    def generate_summary(self, messages: List[Dict]) -> str:
        """Generate a summary of a conversation."""
        if not messages:
            return "Empty conversation."

        # Format messages for the prompt
        conversation_text = self._format_messages_for_analysis(messages)

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert at analyzing conversations and creating concise summaries.
            Create a clear, informative summary that captures:
            1. The main topics discussed
            2. Key decisions or conclusions
            3. Important action items or next steps
            4. Overall context and purpose of the conversation
            
            Keep the summary concise but comprehensive (2-4 sentences)."""),
            ("human", f"Please summarize the following conversation:\n\n{conversation_text}")
        ])

        response = self.llm.invoke(prompt.format_messages())
        return response.content.strip()

    def analyze_sentiment(self, messages: List[Dict]) -> Dict[str, any]:
        """Analyze the sentiment and tone of a conversation."""
        if not messages:
            return {"sentiment": "neutral", "tone": "neutral", "confidence": 0.0}

        conversation_text = self._format_messages_for_analysis(messages)

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert at analyzing conversation sentiment and tone.
            Analyze the conversation and provide:
            1. Overall sentiment (positive, negative, neutral)
            2. Tone (professional, casual, friendly, formal, etc.)
            3. Confidence level (0.0 to 1.0)
            
            Respond in JSON format: {"sentiment": "...", "tone": "...", "confidence": 0.0}"""),
            ("human", f"Analyze the sentiment and tone of this conversation:\n\n{conversation_text}")
        ])

        response = self.llm.invoke(prompt.format_messages())
        try:
            import json
            result = json.loads(response.content.strip())
            return result
        except:
            return {"sentiment": "neutral", "tone": "neutral", "confidence": 0.5}

    def extract_topics(self, messages: List[Dict]) -> List[str]:
        """Extract key topics from a conversation."""
        if not messages:
            return []

        conversation_text = self._format_messages_for_analysis(messages)

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert at extracting key topics from conversations.
            Identify the main topics discussed. Return them as a comma-separated list.
            Focus on the most important and recurring themes."""),
            ("human", f"Extract the key topics from this conversation:\n\n{conversation_text}")
        ])

        response = self.llm.invoke(prompt.format_messages())
        topics = [topic.strip() for topic in response.content.strip().split(',')]
        return topics[:10]  # Limit to top 10 topics

    def extract_action_items(self, messages: List[Dict]) -> List[str]:
        """Extract action items and decisions from a conversation."""
        if not messages:
            return []

        conversation_text = self._format_messages_for_analysis(messages)

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert at identifying action items and decisions in conversations.
            Extract any:
            1. Action items (tasks to be done)
            2. Decisions made
            3. Next steps mentioned
            
            Return them as a bulleted list, one per line."""),
            ("human", f"Extract action items and decisions from this conversation:\n\n{conversation_text}")
        ])

        response = self.llm.invoke(prompt.format_messages())
        items = [item.strip('- ').strip() for item in response.content.strip().split('\n') if item.strip()]
        return items[:10]  # Limit to top 10 items

    def query_past_conversations(
        self,
        query: str,
        conversations: List[Dict],
        max_results: int = 5
    ) -> Dict[str, any]:
        """
        Answer questions about past conversations using AI.
        
        Args:
            query: User's question about past conversations
            conversations: List of conversation dicts with messages
            max_results: Maximum number of relevant conversations to include
            
        Returns:
            Dict with answer, relevant_excerpts, and related_conversations
        """
        if not conversations:
            print("WARNING: No conversations provided to query_past_conversations")
            return {
                "answer": "No past conversations found to query.",
                "relevant_excerpts": [],
                "related_conversations": []
            }

        print(f"Querying {len(conversations)} conversations with query: {query}")
        # Find most relevant conversations using semantic search or keyword matching
        relevant_convs = self._find_relevant_conversations(query, conversations, max_results)
        print(f"Found {len(relevant_convs)} relevant conversations")

        # Format conversations for the prompt
        formatted_convs = []
        for conv in relevant_convs:
            conv_text = f"Conversation ID: {conv.get('id', 'N/A')}\n"
            conv_text += f"Title: {conv.get('title', 'Untitled')}\n"
            conv_text += f"Date: {conv.get('start_timestamp', 'N/A')}\n"
            conv_text += f"Messages:\n{self._format_messages_for_analysis(conv.get('messages', []))}\n"
            formatted_convs.append(conv_text)

        conversations_text = "\n\n---\n\n".join(formatted_convs)

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an intelligent assistant that helps users understand their past conversations.
            Based on the provided conversation histories, answer the user's question accurately and helpfully.
            Include specific details and excerpts when relevant.
            If the information is not available in the provided conversations, say so clearly."""),
            ("human", f"User Question: {query}\n\nPast Conversations:\n\n{conversations_text}\n\nPlease answer the user's question based on these conversations.")
        ])

        response = self.llm.invoke(prompt.format_messages())
        answer = response.content.strip()

        # Extract relevant excerpts
        relevant_excerpts = self._extract_relevant_excerpts(query, relevant_convs)

        return {
            "answer": answer,
            "relevant_excerpts": relevant_excerpts,
            "related_conversations": [
                {
                    "id": conv.get('id'),
                    "title": conv.get('title', 'Untitled'),
                    "start_timestamp": conv.get('start_timestamp')
                }
                for conv in relevant_convs
            ]
        }

    def _format_messages_for_analysis(self, messages: List[Dict]) -> str:
        """Format messages for AI analysis."""
        formatted = []
        for msg in messages:
            sender = msg.get('sender', 'UNKNOWN')
            content = msg.get('content', '')
            timestamp = msg.get('timestamp', '')
            formatted.append(f"[{sender} at {timestamp}]: {content}")
        return "\n".join(formatted)

    def _find_relevant_conversations(
        self,
        query: str,
        conversations: List[Dict],
        max_results: int
    ) -> List[Dict]:
        """Find conversations most relevant to the query."""
        if not conversations:
            return []

        # If embeddings are available, use semantic search
        if self.embeddings_model and EMBEDDINGS_AVAILABLE:
            try:
                query_embedding = self.embeddings_model.encode(query)
                scored_convs = []

                for conv in conversations:
                    # Create a text representation of the conversation
                    conv_text = f"{conv.get('title', '')} "
                    conv_text += " ".join([msg.get('content', '') for msg in conv.get('messages', [])])
                    
                    conv_embedding = self.embeddings_model.encode(conv_text)
                    
                    # Calculate cosine similarity (simplified)
                    try:
                        import numpy as np
                        similarity = np.dot(query_embedding, conv_embedding) / (
                            np.linalg.norm(query_embedding) * np.linalg.norm(conv_embedding)
                        )
                        scored_convs.append((similarity, conv))
                    except Exception as e:
                        print(f"Error calculating similarity: {e}")
                        # Fall through to keyword search

                # Sort by similarity and return top results
                if scored_convs:
                    scored_convs.sort(key=lambda x: x[0], reverse=True)
                    return [conv for _, conv in scored_convs[:max_results]]
            except Exception as e:
                print(f"Error in semantic search: {e}")
                # Fall through to keyword search

        # Fallback to keyword-based search
        query_lower = query.lower()
        scored_convs = []

        for conv in conversations:
            score = 0
            # Check title
            title = conv.get('title', '').lower()
            if query_lower in title:
                score += 10
            
            # Check messages
            for msg in conv.get('messages', []):
                content = msg.get('content', '').lower()
                if query_lower in content:
                    score += 1
                # Also check if any query words appear in the message
                query_words = query_lower.split()
                for word in query_words:
                    if word in content:
                        score += 0.5
            
            # Always include conversations, even with score 0, so AI can analyze all history
            scored_convs.append((score, conv))

        scored_convs.sort(key=lambda x: x[0], reverse=True)
        # Return top results - if no matches found, still return conversations so AI can analyze all history
        return [conv for _, conv in scored_convs[:max_results]]

    def _extract_relevant_excerpts(self, query: str, conversations: List[Dict]) -> List[Dict]:
        """Extract relevant message excerpts from conversations."""
        excerpts = []
        query_lower = query.lower()

        for conv in conversations:
            for msg in conv.get('messages', []):
                content = msg.get('content', '').lower()
                if any(word in content for word in query_lower.split()):
                    excerpts.append({
                        "conversation_id": conv.get('id'),
                        "conversation_title": conv.get('title', 'Untitled'),
                        "content": msg.get('content', '')[:200],  # Truncate long messages
                        "sender": msg.get('sender'),
                        "timestamp": msg.get('timestamp')
                    })
                    if len(excerpts) >= 10:  # Limit excerpts
                        break

        return excerpts[:10]

