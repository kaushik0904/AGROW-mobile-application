import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Share, Modal, TextInput, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../common/theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function PostCard({ post, currentUserId, token, onProfilePress, onOptionsPress, onFollowToggle }) {
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(parseInt(post.likes_count) || 0);
  const [commentsCount, setCommentsCount] = useState(parseInt(post.comments_count) || 0);

  // Comments State
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  const toggleLike = async () => {
    // Optimistic UI Update
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      const response = await fetch(`${API_URL}/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        // Revert on failure
        setIsLiked(wasLiked);
        setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Like error:', error);
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `${post.author_name} posted on AGROW:\n\n"${post.content}"\n\nJoin the conversation on AGROW App!`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const response = await fetch(`${API_URL}/posts/${post.id}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const openComments = () => {
    setIsCommentsVisible(true);
    fetchComments();
  };

  const closeComments = () => {
    setIsCommentsVisible(false);
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`${API_URL}/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment.trim() })
      });
      const data = await response.json();
      if (response.ok) {
        setComments([data.comment, ...comments]);
        setNewComment('');
        setCommentsCount(prev => prev + 1);
      } else {
        Alert.alert('Error', data.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentAvatar}>
        <Text style={styles.commentAvatarText}>{getInitials(item.author_name)}</Text>
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeaderRow}>
          <Text style={styles.commentAuthor}>{item.author_name}</Text>
          <Text style={styles.commentTime}>{formatTimeAgo(item.created_at)}</Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
      </View>
    </View>
  );

  const renderOriginalPost = () => (
    <View style={styles.originalPostContainer}>
      <View style={styles.tweetHeaderRow}>
        <View style={styles.tweetHeader}>
          <Text style={styles.authorName} numberOfLines={1}>{post.author_name}</Text>
          <Text style={styles.authorHandle} numberOfLines={1}>
            @{post.author_name?.toLowerCase().replace(/\s+/g, '')}
          </Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.timeAgo}>{formatTimeAgo(post.created_at)}</Text>
        </View>
      </View>
      <Text style={[styles.tweetContent, { marginTop: 8 }]}>{post.content}</Text>
      {post.image_url && (
        <Image source={{ uri: post.image_url }} style={[styles.tweetImage, { maxHeight: 150 }]} resizeMode="cover" />
      )}
      <View style={styles.commentDivider} />
    </View>
  );

  return (
    <View style={styles.tweetContainer}>
      {/* Left Avatar Column */}
      <TouchableOpacity style={styles.tweetLeft} onPress={onProfilePress}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(post.author_name)}</Text>
        </View>
      </TouchableOpacity>

      {/* Right Content Column */}
      <View style={styles.tweetRight}>
        <View style={styles.tweetHeaderRow}>
          <TouchableOpacity style={styles.tweetHeader} onPress={onProfilePress}>
            <Text style={styles.authorName} numberOfLines={1}>{post.author_name}</Text>
            <Text style={styles.authorHandle} numberOfLines={1}>
              @{post.author_name?.toLowerCase().replace(/\s+/g, '')}
            </Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(post.created_at)}</Text>
          </TouchableOpacity>
          {post.farmer_id === currentUserId && onOptionsPress ? (
            <TouchableOpacity onPress={() => onOptionsPress(post)} style={styles.optionsBtn}>
              <Ionicons name="ellipsis-vertical" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : (post.farmer_id !== currentUserId && onFollowToggle) ? (
            <TouchableOpacity 
              style={[styles.followBtn, post.is_following && styles.followingBtn]} 
              onPress={onFollowToggle}
            >
              <Text style={[styles.followBtnText, post.is_following && styles.followingBtnText]}>
                {post.is_following ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {post.category && (
          <Text style={styles.tweetCategory}>#{post.category}</Text>
        )}

        <Text style={styles.tweetContent}>{post.content}</Text>

        {post.image_url && (
          <Image source={{ uri: post.image_url }} style={styles.tweetImage} />
        )}

        <View style={styles.tweetActions}>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={openComments}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} />
            <Text style={styles.actionText}>{commentsCount}</Text>
          </TouchableOpacity>
          
          {/* Note: Repost count can be added later if needed */}
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <Ionicons name="sync-outline" size={19} color={colors.textMuted} />
            <Text style={styles.actionText}>0</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={toggleLike}>
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={18} color={isLiked ? colors.error : colors.textMuted} />
            <Text style={[styles.actionText, isLiked && { color: colors.error }]}>{likesCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={handleShare}>
            <Ionicons name="share-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments Modal wrapped tightly inside the component */}
      <Modal
        visible={isCommentsVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeComments}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeComments} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Comments</Text>
            <View style={{ width: 24 }} />
          </View>

          <FlatList
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={renderOriginalPost}
            renderItem={renderComment}
            contentContainerStyle={styles.commentsList}
            ListEmptyComponent={() => (
              <Text style={styles.emptyCommentsText}>
                {isLoadingComments ? 'Loading comments...' : 'No comments yet. Be the first to reply!'}
              </Text>
            )}
            ItemSeparatorComponent={() => <View style={styles.commentDivider} />}
          />

          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Post a reply..."
              placeholderTextColor={colors.textMuted}
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !newComment.trim() && { opacity: 0.5 }]} 
              onPress={submitComment}
              disabled={!newComment.trim()}
            >
              <Text style={styles.sendBtnText}>Post</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tweetContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  tweetLeft: { marginRight: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontFamily: fonts.headingSemiBold,
    fontSize: 20,
  },
  tweetRight: { flex: 1 },
  tweetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tweetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  authorName: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginRight: 4,
  },
  authorHandle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  dot: {
    fontSize: 14,
    color: colors.textSecondary,
    marginHorizontal: 4,
  },
  timeAgo: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  optionsBtn: {
    padding: 4,
  },
  followBtn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  followingBtn: {
    backgroundColor: colors.surface,
  },
  followBtnText: {
    fontSize: 12,
    fontFamily: fonts.bodySemiBold,
    color: colors.primaryDark,
  },
  followingBtnText: {
    color: colors.textSecondary,
  },
  tweetCategory: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.primary,
    marginBottom: 4,
  },
  tweetContent: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 10,
  },
  tweetImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tweetActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 32,
    marginTop: 4,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 40 },
  actionText: { fontSize: 13, fontFamily: fonts.body, color: colors.textSecondary },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: Platform.OS === 'ios' ? 40 : 0, // safe area approx for pageSheet
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  modalCloseBtn: {
    padding: 4,
  },
  commentsList: {
    padding: 16,
  },
  originalPostContainer: {
    marginBottom: 8,
  },
  emptyCommentsText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontFamily: fonts.body,
    marginTop: 40,
  },
  commentDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
  },
  commentItem: {
    flexDirection: 'row',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  commentAvatarText: {
    color: colors.textSecondary,
    fontFamily: fonts.headingSemiBold,
    fontSize: 16,
  },
  commentContent: {
    flex: 1,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 6,
  },
  commentAuthor: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  commentTime: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  commentText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    minHeight: 40,
    maxHeight: 100,
    fontFamily: fonts.body,
    fontSize: 15,
    marginRight: 12,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendBtnText: {
    color: colors.white,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  }
});
