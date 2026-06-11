// DB records reference icons by name; map them to lucide components here.
import {
  Zap, Shield, Skull, Crosshair, Cpu, Radar, Backpack, Bomb, Swords, Boxes,
  HeartPulse, Rocket, EyeOff, Hexagon,
} from 'lucide-react';

const ICONS = { Zap, Shield, Skull, Crosshair, Cpu, Radar, Backpack, Bomb, Swords, Boxes, HeartPulse, Rocket, EyeOff };

export const iconFor = (name) => ICONS[name] || Hexagon;
