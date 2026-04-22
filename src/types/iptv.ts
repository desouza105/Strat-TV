/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IPTVChannel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
  tvgId?: string;
}

export interface PlaylistState {
  url: string;
  channels: IPTVChannel[];
  isLoading: boolean;
  error: string | null;
}
