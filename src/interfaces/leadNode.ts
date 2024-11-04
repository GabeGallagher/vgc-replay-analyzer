export interface LeadNode {
  val?: number; //useage rate or winrate
  left?: LeadNode;
  right?: LeadNode;
  lead?: string;
}
