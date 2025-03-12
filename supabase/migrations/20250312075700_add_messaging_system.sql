/*
  # Create messaging system tables

  1. New Tables
    - `conversations` - Represents a conversation between users
    - `conversation_participants` - Junction table to track which users are in which conversations
    - `messages` - Stores individual messages within conversations

  2. Security
    - Enable RLS on all tables
    - Add policies for conversation and message access
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conversation participants junction table
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at triggers for conversations
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at triggers for messages
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a function to update conversation timestamp when new message is added
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation timestamp on new message
CREATE TRIGGER update_conversation_timestamp_on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can see conversations they're part of" 
  ON conversations 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = conversations.id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create new conversations" 
  ON conversations 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- RLS policies for conversation participants
CREATE POLICY "Users can see conversation participants" 
  ON conversation_participants 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = conversation_participants.conversation_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can add conversation participants" 
  ON conversation_participants 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- RLS policies for messages
CREATE POLICY "Users can see messages in their conversations" 
  ON messages 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert messages to their conversations" 
  ON messages 
  FOR INSERT 
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update read status of their messages" 
  ON messages 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  ))
  WITH CHECK (
    -- Only allow updating the read field
    OLD.conversation_id = NEW.conversation_id AND
    OLD.sender_id = NEW.sender_id AND
    OLD.content = NEW.content AND
    OLD.created_at = NEW.created_at
  );
