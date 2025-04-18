import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import config from './index';
import UserModel from '../models/user.model';
import ProfileModel from '../models/profile.model';
import logger from '../utils/logger';

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
      logger.info(`Google authentication callback for profile: ${profile.id}, ${profile.displayName}`);
      try {
        // Check if user exists with the same email
        const email = profile.emails?.[0]?.value;
        if (!email) {
          logger.error('No email found in Google profile:', profile);
          return done(new Error('No email found in Google profile'));
        }

        logger.info(`Authenticating with email: ${email}`);
        let user = await UserModel.findOne({ email });

        if (user) {
          logger.info(`User found with email ${email}, auth provider: ${user.authProvider}`);
          // If user exists but used a different auth method, update the authProvider
          if (user.authProvider !== 'google') {
            logger.info(`Updating user auth provider from ${user.authProvider} to google`);
            user.authProvider = 'google';
            
            // Also update the googleId if it's not already set
            if (!user.googleId) {
              logger.info(`Adding Google ID ${profile.id} to existing user`);
              user.googleId = profile.id;
            }
            
            await user.save();
          }
        } else {
          // Create new user
          logger.info(`Creating new user for email: ${email}`);
          user = await UserModel.create({
            email,
            name: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
            googleId: profile.id,
            authProvider: 'google',
            verified: true, // Google accounts are pre-verified
          });

          // Create default profile for user
          try {
            logger.info(`Creating profile for new user: ${user._id}`);
            await ProfileModel.create({
              userId: user._id,
            });
          } catch (profileError) {
            logger.error(`Failed to create profile for user: ${user._id}`, profileError);
            // Don't abort the authentication process if just the profile creation fails
            // The user can complete their profile later
          }
        }

        logger.info(`Google authentication successful for user: ${user._id}`);
        return done(null, user);
      } catch (error) {
        logger.error('Error in Google authentication callback:', error);
        return done(error as Error);
      }
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user: any, done) => {
  logger.info(`Serializing user: ${user.id}`);
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    logger.info(`Deserializing user: ${id}`);
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    logger.error('Error deserializing user:', error);
    done(error, null);
  }
});

export default passport; 