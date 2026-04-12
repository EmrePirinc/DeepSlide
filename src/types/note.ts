// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

export interface SlideNote {
  id: string; // `${presentationId}__${slideId}`
  presentationId: string;
  slideId: string;
  text: string;
  updatedAt: number;
}
