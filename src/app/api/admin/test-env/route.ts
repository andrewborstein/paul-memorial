export async function GET() {
  return Response.json({
    hasSuperUserPasswords: !!process.env.SUPER_USER_PASSWORDS,
    superUserPasswords: process.env.SUPER_USER_PASSWORDS,
    allEnvVars: Object.keys(process.env).filter(key => key.includes('SUPER') || key.includes('USER')),
  });
}
