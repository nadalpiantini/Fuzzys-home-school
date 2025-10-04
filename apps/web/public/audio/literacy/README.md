# Audio Files for Literacy Activities

This directory contains audio files for literacy activities, specifically for the 'Ñ' sound exercises.

## Required Audio Files

For the literacy level 1 activities, the following audio files should be placed in this directory:

### Words with 'Ñ' sound:
- `nina.mp3` - "niña" (girl)
- `ano.mp3` - "año" (year)  
- `pina.mp3` - "piña" (pineapple)
- `cana.mp3` - "caña" (cane)
- `senor.mp3` - "señor" (sir/mister)
- `nino.mp3` - "niño" (boy)
- `sueno.mp3` - "sueño" (dream)
- `pequeno.mp3` - "pequeño" (small)
- `espanol.mp3` - "español" (Spanish)

### Words without 'Ñ' sound (for comparison):
- `nido.mp3` - "nido" (nest)
- `nube.mp3` - "nube" (cloud)
- `naranja.mp3` - "naranja" (orange)
- `noche.mp3` - "noche" (night)

### Syllables with 'Ñ':
- `nya.mp3` - "ña"
- `nye.mp3` - "ñe"
- `nyi.mp3` - "ñi"
- `nyo.mp3` - "ño"
- `nyu.mp3` - "ñu"

## Audio Specifications

- **Format**: MP3
- **Quality**: 44.1kHz, 128kbps minimum
- **Language**: Spanish (Dominican Republic accent preferred)
- **Voice**: Clear, child-friendly pronunciation
- **Speed**: Slightly slower than normal speech for learning purposes

## Fallback System

If audio files are not available, the system will automatically fall back to text-to-speech using the browser's speech synthesis API.

## Usage

The audio service will automatically:
1. Try to load pre-recorded audio files first
2. Fall back to text-to-speech if files are not available
3. Show appropriate error messages if neither is available

## Adding New Audio Files

To add new audio files:
1. Place the MP3 file in this directory
2. Update the `AudioService.ts` mapping if needed
3. Test the audio playback in the application
