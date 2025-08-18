export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    
    if (!password) {
      return new Response('Password required', { status: 400 });
    }

    // Server-side password validation (not exposed to client)
    const validPasswords = process.env.SUPER_USER_PASSWORDS?.split(',') || [];
    
    console.log('Debug - Valid passwords:', validPasswords);
    console.log('Debug - Submitted password:', password);
    console.log('Debug - Environment variable:', process.env.SUPER_USER_PASSWORDS);
    
    if (validPasswords.includes(password)) {
      return Response.json({ 
        success: true, 
        message: 'Super user mode activated' 
      });
    } else {
      return new Response('Invalid password', { status: 401 });
    }
  } catch (error) {
    console.error('Error validating super user password:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
