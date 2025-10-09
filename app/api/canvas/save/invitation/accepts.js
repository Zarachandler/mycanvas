// // app/api/invitations/route.js
// import { NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';

// // Initialize Supabase client
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// export async function POST(req) {
//   try {
//     const { action, email, boardTitle, canvasData, boardId, accessLevel, token } = await req.json();

//     // Handle different actions
//     if (action === 'create') {
//       return await handleCreateInvitation(email, boardTitle, canvasData, boardId, accessLevel);
//     } else if (action === 'accept') {
//       return await handleAcceptInvitation(token);
//     } else {
//       return NextResponse.json(
//         { error: 'Invalid action. Use "create" or "accept"' },
//         { status: 400 }
//       );
//     }
//   } catch (err) {
//     console.error('API route error:', err);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// // Handle creating new invitation
// async function handleCreateInvitation(email, boardTitle, canvasData, boardId, accessLevel) {
//   if (!email || !boardTitle || !boardId) {
//     return NextResponse.json(
//       { error: 'Email, boardTitle, and boardId are required' },
//       { status: 400 }
//     );
//   }

//   try {
//     // Check if user exists in Supabase Auth
//     const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
//     if (usersError) {
//       console.error('Supabase error:', usersError);
//       return NextResponse.json({ error: usersError.message }, { status: 500 });
//     }

//     const user = usersData.users.find((u) => u.email === email);
//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     const userId = user.id;

//     // Create invitation token
//     const invitationToken = generateInvitationToken();
//     const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

//     // Store invitation in database
//     const { data: invitationData, error: invitationError } = await supabase
//       .from('invitations')
//       .insert([
//         {
//           token: invitationToken,
//           email: email,
//           board_id: boardId,
//           board_title: boardTitle,
//           canvas_data: canvasData,
//           access_level: accessLevel,
//           expires_at: expiresAt.toISOString(),
//           used: false,
//           created_by: userId
//         }
//       ])
//       .select()
//       .single();

//     if (invitationError) {
//       console.error('Invitation creation error:', invitationError);
//       return NextResponse.json({ error: invitationError.message }, { status: 500 });
//     }

//     // Create board for the user if it doesn't exist
//     const { data: boardData, error: boardError } = await supabase
//       .from('boards')
//       .insert([
//         {
//           user_id: userId,
//           title: boardTitle,
//           content: canvasData,
//           board_id: boardId,
//           access_level: accessLevel
//         }
//       ])
//       .select()
//       .single();

//     if (boardError && !boardError.message.includes('duplicate key')) {
//       console.error('Board creation error:', boardError);
//       // Continue even if board creation fails
//     }

//     return NextResponse.json({ 
//       success: true, 
//       token: invitationToken,
//       invitation: invitationData,
//       board: boardData 
//     }, { status: 201 });

//   } catch (error) {
//     console.error('Create invitation error:', error);
//     return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
//   }
// }

// // Handle accepting invitation
// async function handleAcceptInvitation(token) {
//   if (!token || typeof token !== 'string') {
//     return NextResponse.json(
//       { error: 'Valid invitation token is required' },
//       { status: 400 }
//     );
//   }

//   // Validate token format
//   if (token.length !== 64 || !/^[a-f0-9]+$/.test(token)) {
//     return NextResponse.json(
//       { error: 'Invitation not found' },
//       { status: 404 }
//     );
//   }

//   try {
//     // Verify invitation token from database
//     const invitation = await verifyInvitationToken(token);
//     if (!invitation) {
//       return NextResponse.json(
//         { error: 'Invitation not found' },
//         { status: 404 }
//       );
//     }

//     // Check if invitation is used or expired
//     if (invitation.used) {
//       await removeInvitationToken(token);
//       return NextResponse.json(
//         { error: 'Invitation not found' },
//         { status: 404 }
//       );
//     }

//     if (new Date() > invitation.expiresAt) {
//       await removeInvitationToken(token);
//       return NextResponse.json(
//         { error: 'Invitation not found' },
//         { status: 404 }
//       );
//     }

//     // Mark invitation as used
//     await markInvitationAsUsed(token);

//     // Get or create user
//     const user = await createOrUpdateUser(invitation.email);
//     if (!user) {
//       return NextResponse.json(
//         { error: 'User not found' },
//         { status: 404 }
//       );
//     }
    
//     // Create board for the user with the invited content
//     const { data: boardData, error: boardError } = await supabase
//       .from('boards')
//       .insert([
//         {
//           user_id: user.id,
//           title: invitation.boardTitle,
//           content: invitation.canvasData,
//           board_id: invitation.boardId,
//           access_level: invitation.accessLevel,
//           invited: true
//         }
//       ])
//       .select()
//       .single();

//     if (boardError) {
//       console.error('Board creation error during acceptance:', boardError);
//     }

//     // Create user session
//     const session = await createUserSession(user);
    
//     // Log the acceptance
//     await logInvitationAcceptance(invitation.id, user.id);

//     // Remove the used token
//     await removeInvitationToken(token);

//     return NextResponse.json({
//       message: 'Invitation accepted successfully',
//       user: {
//         id: user.id,
//         email: user.email
//       },
//       board: boardData,
//       session
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Accept invitation error:', error);
//     return NextResponse.json(
//       { error: 'Failed to accept invitation' },
//       { status: 500 }
//     );
//   }
// }

// // Utility functions
// function generateInvitationToken() {
//   return Array.from(crypto.getRandomValues(new Uint8Array(32)))
//     .map(b => b.toString(16).padStart(2, '0'))
//     .join('');
// }

// // Database functions
// async function verifyInvitationToken(token) {
//   const { data, error } = await supabase
//     .from('invitations')
//     .select('*')
//     .eq('token', token)
//     .single();

//   if (error || !data) {
//     return null;
//   }

//   return {
//     id: data.id,
//     email: data.email,
//     expiresAt: new Date(data.expires_at),
//     used: data.used,
//     boardId: data.board_id,
//     boardTitle: data.board_title,
//     accessLevel: data.access_level,
//     canvasData: data.canvas_data
//   };
// }

// async function markInvitationAsUsed(token) {
//   await supabase
//     .from('invitations')
//     .update({ used: true, used_at: new Date().toISOString() })
//     .eq('token', token);
// }

// async function removeInvitationToken(token) {
//   await supabase
//     .from('invitations')
//     .delete()
//     .eq('token', token);
// }

// async function createOrUpdateUser(email) {
//   try {
//     // Get the existing user from Supabase Auth
//     const { data: usersData, error } = await supabase.auth.admin.listUsers();
//     if (error) {
//       console.error('Error fetching users:', error);
//       return null;
//     }

//     const user = usersData.users.find((u) => u.email === email);
    
//     if (!user || !user.email) {
//       console.error('User not found or email is missing');
//       return null;
//     }

//     return { 
//       id: user.id, 
//       email: user.email
//     };
//   } catch (error) {
//     console.error('Error in createOrUpdateUser:', error);
//     return null;
//   }
// }

// async function createUserSession(user) {
//   // Create a session token or use Supabase session
//   try {
//     const { data } = await supabase.auth.admin.createUser({
//       email: user.email,
//     });
    
//     return data.user?.id || `session_${user.id}`;
//   } catch (error) {
//     console.error('Error creating user session:', error);
//     return `session_${user.id}`;
//   }
// }

// async function logInvitationAcceptance(invitationId, userId) {
//   console.log(`Invitation ${invitationId} accepted by user ${userId} at ${new Date().toISOString()}`);
  
//   // You could also log this to a separate audit table
//   try {
//     await supabase
//       .from('invitation_logs')
//       .insert([
//         {
//           invitation_id: invitationId,
//           user_id: userId,
//           accepted_at: new Date().toISOString()
//         }
//       ]);
//   } catch (error) {
//     console.error('Error logging invitation acceptance:', error);
//   }
// }