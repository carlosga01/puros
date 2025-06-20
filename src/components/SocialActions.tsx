'use client';

import { useState, useEffect } from 'react';
import { Group, ActionIcon, Text, Modal, Stack, Textarea, Button, ScrollArea, Avatar, Box, Divider, Menu } from '@mantine/core';
import { IconHeart, IconHeartFilled, IconMessageCircle, IconLink, IconCheck, IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { createClient } from '@/utils/supabase/client';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';

interface SocialActionsProps {
  reviewId: string;
  userId: string | null;
  initialLikesCount?: number;
  initialCommentsCount?: number;
  showInlineComments?: boolean;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

export default function SocialActions({ 
  reviewId, 
  userId, 
  initialLikesCount = 0, 
  initialCommentsCount = 0,
  showInlineComments = false
}: SocialActionsProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [comments, setComments] = useState<Comment[]>([]);
  const [firstComment, setFirstComment] = useState<Comment | null>(null);
  const [commentsOpened, setCommentsOpened] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  
  const supabase = createClient();

  const form = useForm({
    initialValues: {
      content: '',
    },
    validate: {
      content: (value) => value.trim().length === 0 ? 'Comment cannot be empty' : null,
    },
  });

  // Check if user has liked this review and fetch first comment
  useEffect(() => {
    if (userId) {
      checkUserLike();
    }
    if (showInlineComments) {
      fetchFirstComment();
    }
    fetchCounts();
  }, [userId, reviewId, showInlineComments]);

  const checkUserLike = async () => {
    if (!userId) return;
    
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('review_id', reviewId)
      .maybeSingle();
    
    setLiked(!!data);
  };

  const handleLike = async () => {
    if (!userId) {
      notifications.show({
        title: 'Please log in',
        message: 'You need to be logged in to like posts',
        color: 'red',
      });
      return;
    }

    setLoading(true);

    try {
      if (liked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', userId)
          .eq('review_id', reviewId);

        if (error) throw error;
        
        setLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: userId,
            review_id: reviewId,
          });

        if (error) throw error;
        
        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update like',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    // Fetch likes count
    const { count: likesCount } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', reviewId);

    // Fetch comments count
    const { count: commentsCount } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', reviewId);

    if (likesCount !== null) setLikesCount(likesCount);
    if (commentsCount !== null) setCommentsCount(commentsCount);
  };

  const fetchFirstComment = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        user_id,
        content,
        created_at,
        profiles!inner(first_name, last_name, avatar_url)
      `)
      .eq('review_id', reviewId)
      .order('created_at', { ascending: true })
      .limit(1);

    if (error) {
      console.error('Error fetching first comment:', error);
    } else if (data && data.length > 0) {
      // @ts-expect-error - Supabase type inference issue
      setFirstComment(data[0]);
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        user_id,
        content,
        created_at,
        profiles!inner(first_name, last_name, avatar_url)
      `)
      .eq('review_id', reviewId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      // @ts-expect-error - Supabase type inference issue
      setComments(data || []);
    }
  };

  const handleOpenComments = () => {
    if (showInlineComments) {
      setShowCommentInput(!showCommentInput);
    } else {
      setCommentsOpened(true);
      fetchComments();
    }
  };

  const handleSubmitComment = async (values: typeof form.values) => {
    if (!userId) {
      notifications.show({
        title: 'Please log in',
        message: 'You need to be logged in to comment',
        color: 'red',
      });
      return;
    }

    setCommentLoading(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          user_id: userId,
          review_id: reviewId,
          content: values.content.trim(),
        });

      if (error) throw error;

      form.reset();
      setCommentsCount(prev => prev + 1);
      if (showInlineComments) {
        fetchFirstComment();
        setShowCommentInput(false);
      } else {
        fetchComments();
      }
      
      notifications.show({
        title: 'Comment posted',
        message: 'Your comment has been added',
        color: 'green',
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to post comment',
        color: 'red',
      });
    } finally {
      setCommentLoading(false);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleSaveCommentEdit = async (commentId: string) => {
    if (!editingContent.trim()) return;

    setCommentLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editingContent.trim() })
        .eq('id', commentId);

      if (error) throw error;

      // Update the comment in the local state
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: editingContent.trim() }
          : comment
      ));

      if (firstComment && firstComment.id === commentId) {
        setFirstComment({ ...firstComment, content: editingContent.trim() });
      }

      setEditingCommentId(null);
      setEditingContent('');

      notifications.show({
        title: 'Comment updated',
        message: 'Your comment has been updated successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update comment',
        color: 'red',
      });
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setCommentLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // Remove comment from local state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setCommentsCount(prev => Math.max(0, prev - 1));

      // If it was the first comment, refetch it
      if (firstComment && firstComment.id === commentId) {
        fetchFirstComment();
      }

      notifications.show({
        title: 'Comment deleted',
        message: 'Your comment has been deleted',
        color: 'green',
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete comment',
        color: 'red',
      });
    } finally {
      setCommentLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleShare = async () => {
    // Always copy link to clipboard and show checkmark
    const url = `${window.location.origin}/review/${reviewId}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      // Reset back to link icon after 2 seconds
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      
      // Fallback: try using the older execCommand method
      try {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setLinkCopied(true);
        // Reset back to link icon after 2 seconds
        setTimeout(() => setLinkCopied(false), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        // Don't show checkmark if copy failed
      }
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Stack gap="md" w="100%">
      {/* Action Buttons */}
      <Group justify="space-between">
        <Group>
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={handleLike}
              loading={loading}
              color={liked ? 'red' : 'gray'}
            >
              {liked ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
            </ActionIcon>
            <Text size="sm" c="dimmed">
              {likesCount}
            </Text>
          </Group>

          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={handleOpenComments}
            >
              <IconMessageCircle size={20} />
            </ActionIcon>
            <Text size="sm" c="dimmed">
              {commentsCount}
            </Text>
          </Group>

          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={handleShare}
            style={{
              color: linkCopied ? '#22c55e' : undefined, // Green when copied
            }}
          >
            {linkCopied ? <IconCheck size={20} /> : <IconLink size={20} />}
          </ActionIcon>
        </Group>
      </Group>

      {/* Inline Comments Section */}
      {showInlineComments && (
        <Stack gap="lg" mt="sm" w="100%">
          {/* First Comment */}
          {firstComment && (
            <Group align="flex-start" gap="sm">
              <Avatar
                src={firstComment.profiles.avatar_url}
                size="sm"
                radius="xl"
                color="brand"
              >
                {getInitials(firstComment.profiles.first_name, firstComment.profiles.last_name)}
              </Avatar>
              <Stack gap="xs" style={{ flex: 1 }}>
                <Group justify="space-between" align="flex-start">
                  <Group gap="xs">
                    <Text fw={500} size="sm">
                      {firstComment.profiles.first_name} {firstComment.profiles.last_name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {formatDate(firstComment.created_at)}
                    </Text>
                  </Group>
                  {userId === firstComment.user_id && (
                    <Menu shadow="md" width={160} withinPortal>
                      <Menu.Target>
                        <ActionIcon 
                          variant="subtle" 
                          size="sm"
                          style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                        >
                          <IconDotsVertical size={14} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown 
                        style={{
                          backgroundColor: 'rgba(30, 30, 40, 0.95)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(10px)',
                          zIndex: 10000,
                        }}
                      >
                        <Menu.Item
                          leftSection={<IconEdit size={14} />}
                          onClick={() => handleEditComment(firstComment)}
                          style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          onClick={() => handleDeleteComment(firstComment.id)}
                          style={{ color: 'rgba(255, 100, 100, 0.9)' }}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  )}
                </Group>
                {editingCommentId === firstComment.id ? (
                  <Stack gap="xs">
                    <Textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      autosize
                      minRows={2}
                      maxRows={4}
                      styles={{
                        input: {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'rgba(255, 255, 255, 0.9)',
                        }
                      }}
                    />
                    <Group gap="xs">
                      <Button
                        size="xs"
                        onClick={() => handleSaveCommentEdit(firstComment.id)}
                        loading={commentLoading}
                        variant="filled"
                      >
                        Save
                      </Button>
                      <Button
                        size="xs"
                        variant="subtle"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </Group>
                  </Stack>
                ) : (
                  <Text size="sm" style={{ lineHeight: 1.4 }}>
                    {firstComment.content}
                  </Text>
                )}
              </Stack>
            </Group>
          )}

          {/* View More Comments Link */}
          {commentsCount > 1 && (
            <Text 
              size="sm" 
              c="dimmed" 
              style={{ cursor: 'pointer' }}
              onClick={() => window.location.href = `/review/${reviewId}`}
            >
              View all {commentsCount} comments
            </Text>
          )}

          {/* Comment Input */}
          {userId ? (
            showCommentInput ? (
              <Box w="100%">
                <form onSubmit={form.onSubmit(handleSubmitComment)} style={{ width: '100%' }}>
                  <Stack gap="xs" w="100%">
                    <Textarea
                      placeholder="Write a comment..."
                      {...form.getInputProps('content')}
                      autosize
                      minRows={2}
                      maxRows={4}
                      autoFocus
                      w="100%"
                      styles={{
                        root: { width: '100%' },
                        wrapper: { width: '100%' },
                        input: {
                          width: '100%',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          '&:focus': {
                            borderColor: 'var(--mantine-color-brand-6)'
                          }
                        }
                      }}
                    />
                    <Group justify="space-between" w="100%">
                      <Button
                        variant="subtle"
                        size="xs"
                        onClick={() => {
                          setShowCommentInput(false);
                          form.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="xs"
                        loading={commentLoading}
                        variant="gradient"
                        gradient={{ from: 'brand.6', to: 'brand.8' }}
                        disabled={!form.values.content.trim()}
                      >
                        Post
                      </Button>
                    </Group>
                  </Stack>
                </form>
              </Box>
            ) : (
              <Text
                size="sm"
                c="dimmed"
                w="100%"
                style={{ 
                  cursor: 'pointer',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  width: '100%',
                  display: 'block'
                }}
                onClick={() => setShowCommentInput(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                Add a comment...
              </Text>
            )
          ) : (
            <Text
              size="sm"
              c="dimmed"
              w="100%"
              style={{ 
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                textAlign: 'center',
                width: '100%',
                display: 'block'
              }}
            >
              Log in to add a comment
            </Text>
          )}
        </Stack>
      )}

      {/* Comments Modal */}
      <Modal
        opened={commentsOpened}
        onClose={() => setCommentsOpened(false)}
        title="Comments"
        size="md"
        styles={{
          content: {
            backgroundColor: 'rgba(30, 30, 40, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          header: {
            backgroundColor: 'transparent',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        <Stack gap="md">
          {/* Comment Form */}
          {userId && (
            <Box>
              <form onSubmit={form.onSubmit(handleSubmitComment)}>
                <Stack gap="sm">
                  <Textarea
                    placeholder="Write a comment..."
                    {...form.getInputProps('content')}
                    autosize
                    minRows={2}
                    maxRows={4}
                    styles={{
                      input: {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        '&:focus': {
                          borderColor: 'var(--mantine-color-brand-6)'
                        }
                      }
                    }}
                  />
                  <Group justify="flex-end">
                    <Button
                      type="submit"
                      size="sm"
                      loading={commentLoading}
                      variant="gradient"
                      gradient={{ from: 'brand.6', to: 'brand.8' }}
                    >
                      Post Comment
                    </Button>
                  </Group>
                </Stack>
              </form>
              <Divider my="md" />
            </Box>
          )}

          {/* Comments List */}
          <ScrollArea.Autosize mah={400}>
            <Stack gap="md">
              {comments.length === 0 ? (
                <Text c="dimmed" ta="center" py="xl">
                  No comments yet. Be the first to comment!
                </Text>
              ) : (
                comments.map((comment) => (
                  <Group key={comment.id} align="flex-start" gap="sm">
                    <Avatar
                      src={comment.profiles.avatar_url}
                      size="sm"
                      radius="xl"
                      color="brand"
                    >
                      {getInitials(comment.profiles.first_name, comment.profiles.last_name)}
                    </Avatar>
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Group justify="space-between" align="flex-start">
                        <Group gap="xs">
                          <Text fw={500} size="sm">
                            {comment.profiles.first_name} {comment.profiles.last_name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {formatDate(comment.created_at)}
                          </Text>
                        </Group>
                        {userId === comment.user_id && (
                          <Menu shadow="md" width={160} withinPortal>
                            <Menu.Target>
                              <ActionIcon 
                                variant="subtle" 
                                size="sm"
                                style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                              >
                                <IconDotsVertical size={14} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown 
                              style={{
                                backgroundColor: 'rgba(30, 30, 40, 0.95)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                backdropFilter: 'blur(10px)',
                                zIndex: 10000,
                              }}
                            >
                              <Menu.Item
                                leftSection={<IconEdit size={14} />}
                                onClick={() => handleEditComment(comment)}
                                style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                              >
                                Edit
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                onClick={() => handleDeleteComment(comment.id)}
                                style={{ color: 'rgba(255, 100, 100, 0.9)' }}
                              >
                                Delete
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        )}
                      </Group>
                      {editingCommentId === comment.id ? (
                        <Stack gap="xs">
                          <Textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            autosize
                            minRows={2}
                            maxRows={4}
                            styles={{
                              input: {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'rgba(255, 255, 255, 0.9)',
                              }
                            }}
                          />
                          <Group gap="xs">
                            <Button
                              size="xs"
                              onClick={() => handleSaveCommentEdit(comment.id)}
                              loading={commentLoading}
                              variant="filled"
                            >
                              Save
                            </Button>
                            <Button
                              size="xs"
                              variant="subtle"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                          </Group>
                        </Stack>
                      ) : (
                        <Text size="sm" style={{ lineHeight: 1.4 }}>
                          {comment.content}
                        </Text>
                      )}
                    </Stack>
                  </Group>
                ))
              )}
            </Stack>
          </ScrollArea.Autosize>
        </Stack>
      </Modal>
    </Stack>
  );
} 