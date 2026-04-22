/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IPTVChannel } from '../types/iptv';

export function parseM3U(content: string): IPTVChannel[] {
  const lines = content.split('\n');
  const channels: IPTVChannel[] = [];
  let currentChannel: Partial<IPTVChannel> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      // Parse EXTINF metadata
      // Format: #EXTINF:-1 tvg-id="ID" tvg-name="Name" tvg-logo="Logo" group-title="Group",Channel Name
      const infoPart = line.substring(8);
      const commaIndex = infoPart.lastIndexOf(',');
      
      const metadata = infoPart.substring(0, commaIndex);
      const name = infoPart.substring(commaIndex + 1).trim();
      
      // Clean name: replace hyphens with spaces and clean up
      currentChannel.name = name.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Extract logic for attributes
      const extractAttr = (attr: string) => {
        const regex = new RegExp(`${attr}="([^"]*)"`, 'i');
        const match = metadata.match(regex);
        return match ? match[1] : undefined;
      };

      currentChannel.logo = extractAttr('tvg-logo');
      currentChannel.group = extractAttr('group-title');
      currentChannel.tvgId = extractAttr('tvg-id');
      currentChannel.id = currentChannel.tvgId || `channel-${channels.length}`;
    } else if (line.startsWith('http')) {
      // This is the stream URL
      if (currentChannel.name) {
        currentChannel.url = line;
        channels.push(currentChannel as IPTVChannel);
      }
      currentChannel = {};
    }
  }

  return channels;
}
