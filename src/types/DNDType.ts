import { UniqueIdentifier } from '@dnd-kit/core';

export type DNDType = {
  id: UniqueIdentifier; // Unique Id for Containers
  title: string;
  items: {
    id: UniqueIdentifier; // Unique Id for Items
    title: string;
  }[];
};
