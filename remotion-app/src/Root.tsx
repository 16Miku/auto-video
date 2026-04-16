import "./index.css";
import { Composition } from "remotion";
import { UniClawWebsitePromo } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="UniClawWebsitePromoV1"
        component={UniClawWebsitePromo}
        durationInFrames={1986}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
