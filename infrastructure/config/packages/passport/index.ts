import passport from "passport";
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from "passport-jwt";
import { container } from "tsyringe";

import { logger } from "../../../../utils";
import { EnvConfiguration } from "../../../../utils/env-config";
import { UserRepository } from "../../../repositories/user/user-repository";

const setupPassport = () => {
  const envConfig = container.resolve(EnvConfiguration);
  const userRepository = container.resolve(UserRepository);

  const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: envConfig.JWT_SECRET,
    issuer: envConfig.JWT_ISSUER,
    audience: envConfig.JWT_AUDIENCE,
  };

  passport.use(
    new JwtStrategy(options, async (payload, done) => {
      try {
        const user = await userRepository.findById(payload.sub);

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        logger("Passport JWT Strategy Error:", error);
        return done(error, false);
      }
    })
  );
};

setupPassport();
export default passport;
