import rawSourcePacket from "@/data/sourcePacket.json";
import { sourcePacketSchema, type SourcePacket } from "@/lib/schemas";

export const sourcePacket: SourcePacket =
  sourcePacketSchema.parse(rawSourcePacket);
