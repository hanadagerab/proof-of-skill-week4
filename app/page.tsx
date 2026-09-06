import { ProofCheckpointClient } from "@/components/ProofCheckpointClient";
import { sourcePacket } from "@/lib/sourcePacket";

export default function Home() {
  return <ProofCheckpointClient packet={sourcePacket} />;
}
