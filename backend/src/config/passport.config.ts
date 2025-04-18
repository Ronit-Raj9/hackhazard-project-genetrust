import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import config from './index';
import UserModel from '../models/user.model';
import ProfileModel from '../models/profile.model';

/**
 * Configure Passport.js for Google OAuth 2.0 authentication
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_REDIRECT_URI,
      scope: ['profile', 'email'],
    },
    async (
      accessToken: string, 
      refreshToken: string, 
      profile: Profile, 
      done: VerifyCallback
    ) => {
      try {
        // Check if user exists with the same email
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'));
        }

        let user = await UserModel.findOne({ email });

        if (user) {
          // If user exists but used a different auth method, update the authProvider
          if (user.authProvider !== 'google') {
            user.authProvider = 'google';
            await user.save();
          }
        } else {
          // Create new user
          user = await UserModel.create({
            email,
            name: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
            authProvider: 'google',
            verified: true, // Google accounts are pre-verified
          });

          // Create default profile for user
          await ProfileModel.create({
            user: user._id,
            displayName: user.name,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport; 