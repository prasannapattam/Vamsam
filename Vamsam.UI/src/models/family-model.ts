export interface FamilyModel {
  id: string;
  name: string;
  gender: string;
  parentId: string;
  size?: number;
  spouseId?: string;
  spouseName?: string;
  spouseGender?: string;
}
