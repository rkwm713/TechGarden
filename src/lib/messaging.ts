import { supabase } from '../supabaseClient';
import { Conversation, Message, Profile } from './types';
import { AppError, ErrorType, tryCatch, handleError } from './errorHandling';

/**
 * Get all conversations for the current user
 */
export const getConversations = async (): Promise<Conversation[]> => {
  const result = await tryCatch<Conversation[]>(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new AppError('User not authenticated', ErrorType.AUTHENTICATION);
    }

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
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
      .order('updated_at', { ascending: false });

    if (error) {
      throw handleError(error);
    }
  
    // Define types for the API response structure
    type ConversationResponse = {
      id: string;
      created_at: string;
      updated_at: string;
      participants: {
        user: Profile
      }[];
      last_message: {
        id: string;
        conversation_id: string;
        content: string;
        sender_id: string;
        read: boolean;
        created_at: string;
        updated_at: string;
      }[];
    };

    // Process the data to get the last message for each conversation
    return (data as ConversationResponse[]).map(conversation => {
      const lastMessage = conversation.last_message.length > 0 
        ? conversation.last_message.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0] 
        : null;
      
      return {
        ...conversation,
        participants: conversation.participants.map((p) => p.user),
        last_message: lastMessage || undefined
      } as Conversation;
    });
  });

  // If there was an error, return an empty array rather than undefined
  return result || [];
};

/**
 * Get all messages in a conversation
 * @param conversationId The ID of the conversation
 */
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const result = await tryCatch<Message[]>(async () => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(id, username, role)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw handleError(error);
    }
    return data as Message[];
  });
  
  return result || [];
};

/**
 * Send a message in a conversation
 * @param conversationId The ID of the conversation
 * @param content The message content
 */
export const sendMessage = async (conversationId: string, content: string): Promise<Message | null> => {
  const result = await tryCatch<Message>(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new AppError('User not authenticated', ErrorType.AUTHENTICATION);
    }

    if (!content.trim()) {
      throw new AppError('Message content cannot be empty', ErrorType.VALIDATION);
    }

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
      .single();

    if (error) {
      throw handleError(error);
    }
    return data as Message;
  });
  
  return result || null;
};

/**
 * Mark messages as read
 * @param messageIds Array of message IDs to mark as read
 */
export const markMessagesAsRead = async (messageIds: string[]): Promise<boolean> => {
  if (!messageIds.length) return true;
  
  const result = await tryCatch<void>(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new AppError('User not authenticated', ErrorType.AUTHENTICATION);
    }
    
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .in('id', messageIds);

    if (error) {
      throw handleError(error);
    }
  });
  
  // Return success status
  return result !== undefined;
};

/**
 * Create a new conversation with selected users
 * @param participantIds Array of user IDs to include in the conversation
 */
export const createConversation = async (participantIds: string[]): Promise<Conversation | null> => {
  const result = await tryCatch<Conversation>(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new AppError('User not authenticated', ErrorType.AUTHENTICATION);
    }
    
    if (!participantIds.length) {
      throw new AppError('At least one participant is required', ErrorType.VALIDATION);
    }
    
    // Add current user to participants if not already included
    if (!participantIds.includes(userData.user.id)) {
      participantIds.push(userData.user.id);
    }

    // 1. Create the conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (conversationError) {
      throw handleError(conversationError);
    }
    
    // 2. Add participants
    const participants = participantIds.map(userId => ({
      conversation_id: conversation.id,
      user_id: userId
    }));
    
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participants);

    if (participantsError) {
      // Try to delete the conversation if adding participants fails
      await supabase.from('conversations').delete().eq('id', conversation.id);
      throw handleError(participantsError);
    }
    
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
      .single();
      
    if (fetchError) {
      throw handleError(fetchError);
    }
    
    // Define the response type for better type safety
    type ConversationParticipantResponse = {
      id: string;
      created_at: string;
      updated_at: string;
      participants: {
        user: Profile
      }[];
    };
    
    return {
      ...createdConversation,
      participants: (createdConversation as ConversationParticipantResponse).participants.map((p) => p.user)
    } as Conversation;
  });
  
  return result || null;
};

/**
 * Get users for starting a new conversation
 */
export const getUsers = async (): Promise<Profile[]> => {
  const result = await tryCatch<Profile[]>(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new AppError('User not authenticated', ErrorType.AUTHENTICATION);
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, role')
      .neq('id', userData.user.id);

    if (error) {
      throw handleError(error);
    }
    
    return data as Profile[];
  });
  
  return result || [];
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
  try {
    if (!conversationId) {
      console.error('Invalid conversation ID for subscription');
      return () => {};
    }
    
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
          try {
            // Fetch the sender information for the new message
            const { data, error } = await supabase
              .from('profiles')
              .select('id, username, role')
              .eq('id', payload.new.sender_id)
              .single();

            if (error) {
              console.error('Error fetching message sender:', error);
              return;
            }

            onNewMessage({
              ...payload.new,
              sender: data as Profile
            } as Message);
          } catch (error) {
            console.error('Error in message subscription handler:', error);
          }
        }
      )
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          console.warn(`Subscription status for messages:${conversationId}: ${status}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Error setting up message subscription:', error);
    return () => {};
  }
};
