import { supabase } from '../supabaseClient';
import { Conversation, Message, Profile } from './types';

/**
 * Get all conversations for the current user
 */
export const getConversations = async (): Promise<Conversation[]> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,4
      participants:conversation_participants(
        user:profiles(id, username, role)
      ),
      last_message:messages(
        id, 
        content, 
        sender_id, 
        read,
        created_at
      )
    `)
    .order('updated_at', { ascending: false })
    .throwOnError();

  if (error) throw error;
  
  // Process the data to get the last message for each conversation
  return (data as any[]).map(conversation => {
    const lastMessage = conversation.last_message.length > 0 
      ? conversation.last_message.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0] 
      : null;
    
    return {
      ...conversation,
      participants: conversation.participants.map((p: any) => p.user),
      last_message: lastMessage || undefined
    };
  });
};

/**
 * Get all messages in a conversation
 * @param conversationId The ID of the conversation
 */
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles(id, username, role)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .throwOnError();

  if (error) throw error;
  return data as Message[];
};

/**
 * Send a message in a conversation
 * @param conversationId The ID of the conversation
 * @param content The message content
 */
export const sendMessage = async (conversationId: string, content: string): Promise<Message> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: userData.user.id,
      content,
      read: false
    })
    .select(`
      *,
      sender:profiles(id, username, role)
    `)
    .single()
    .throwOnError();

  if (error) throw error;
  return data as Message;
};

/**
 * Mark messages as read
 * @param messageIds Array of message IDs to mark as read
 */
export const markMessagesAsRead = async (messageIds: string[]): Promise<void> => {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .in('id', messageIds)
    .throwOnError();

  if (error) throw error;
};

/**
 * Create a new conversation with selected users
 * @param participantIds Array of user IDs to include in the conversation
 */
export const createConversation = async (participantIds: string[]): Promise<Conversation> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');
  
  // Add current user to participants if not already included
  if (!participantIds.includes(userData.user.id)) {
    participantIds.push(userData.user.id);
  }

  // Start a transaction using RPC (if available) or do it manually
  // 1. Create the conversation
  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .insert({})
    .select()
    .single()
    .throwOnError();

  if (conversationError) throw conversationError;
  
  // 2. Add participants
  const participants = participantIds.map(userId => ({
    conversation_id: conversation.id,
    user_id: userId
  }));
  
  const { error: participantsError } = await supabase
    .from('conversation_participants')
    .insert(participants)
    .throwOnError();

  if (participantsError) throw participantsError;
  
  // Get the created conversation with participants
  const { data: createdConversation, error: fetchError } = await supabase
    .from('conversations')
    .select(`
      *,
      participants:conversation_participants(
        user:profiles(id, username, role)
      )
    `)
    .eq('id', conversation.id)
    .single()
    .throwOnError();
    
  if (fetchError) throw fetchError;
  
  return {
    ...createdConversation,
    participants: (createdConversation as any).participants.map((p: any) => p.user)
  } as Conversation;
};

/**
 * Get users for starting a new conversation
 */
export const getUsers = async (): Promise<Profile[]> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, role')
    .neq('id', userData.user.id)
    .throwOnError();

  if (error) throw error;
  return data as Profile[];
};

/**
 * Setup real-time subscription for new messages in a conversation
 * @param conversationId The ID of the conversation to subscribe to
 * @param onNewMessage Callback function when a new message is received
 */
export const subscribeToMessages = (
  conversationId: string,
  onNewMessage: (message: Message) => void
) => {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      async (payload) => {
        // Fetch the sender information for the new message
        const { data } = await supabase
          .from('profiles')
          .select('id, username, role')
          .eq('id', payload.new.sender_id)
          .single();

        onNewMessage({
          ...payload.new,
          sender: data as Profile
        } as Message);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
