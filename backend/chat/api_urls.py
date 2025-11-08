from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ChatViewSet, AgentViewSet, ConversationViewSet, ConversationQueryView

router = DefaultRouter()
router.register(r'chats', ChatViewSet)
router.register(r'agents', AgentViewSet)
router.register(r'conversations', ConversationViewSet, basename='conversation')

urlpatterns = [
    # Put explicit paths before router to avoid conflicts
    path('conversations/query/', ConversationQueryView.as_view(), name='conversation-query'),
    path('', include(router.urls)),
]