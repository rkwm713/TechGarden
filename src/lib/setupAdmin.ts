import { supabase } from './supabase';

export async function setupAdminUser() {
  try {
    // First check if we can sign in with admin credentials
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@ts',
      password: 'admin123'
    });

    // If sign in succeeds or user already exists, we're done
    if (!signInError || signInError.message.includes('Invalid login credentials')) {
      console.log('Admin user exists');
      return;
    }

    // If sign in fails because user doesn't exist, create the admin user
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@ts',
      password: 'admin123'
    });

    if (signUpError) {
      if (signUpError.message.includes('User already registered')) {
        console.log('Admin user already exists');
        return;
      }
      throw signUpError;
    }

    if (user) {
      // Create admin profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          email: 'admin@ts',
          username: 'admin',
          role: 'admin'
        }]);

      if (profileError) {
        console.error('Error creating admin profile:', profileError);
        return;
      }

      console.log('Admin user and profile created successfully');
    }
  } catch (error) {
    console.error('Error in admin setup:', error);
  }
}