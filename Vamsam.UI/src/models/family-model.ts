export interface FamilyModel {
  id: string;
  childId: string;
  name: string;
  gender: string;
  parentId: string;
  childOrder: number; // currently not used in UI
  size?: number;
  spouseId?: string;
  spouseName?: string;
  spouseGender?: string;
  spouseOrder?: number; // currently not used in UI
  primarySpouseId?: string; // used in multiple spouses for the second spouse
}
