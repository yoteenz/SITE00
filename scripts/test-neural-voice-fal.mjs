import { fal } from '@fal-ai/client';
import { buildFalMinimaxInput } from '../api/_lib/site00Evolve/founderCharacterDiscovery/neuralVoiceGenerationService.js';
import {
  compileNeuralVoiceCastingContract,
  NEURAL_CASTING_TERRITORIES,
  selectNeuralVoiceCastingModel,
} from '../shared/site00-studio-world-production/embodiedCharacterVoice/neuralVoiceCasting.js';
import { buildDefaultVoiceCapabilityRegistry } from '../shared/site00-studio-world-production/embodiedCharacterVoice/voiceGenerationCapability.js';
import { DEFAULT_NEURAL_CASTING_LINE } from '../shared/site00-studio-world-production/embodiedCharacterVoice/constants.js';

fal.config({ credentials: process.env.FAL_KEY });
const selection = selectNeuralVoiceCastingModel({ capabilities: buildDefaultVoiceCapabilityRegistry() });

for (const t of NEURAL_CASTING_TERRITORIES) {
  const contract = compileNeuralVoiceCastingContract({
    hypothesis: { id: 'h1', spokenCopy: DEFAULT_NEURAL_CASTING_LINE },
    territory: t,
    selection,
  });
  const input = buildFalMinimaxInput(contract);
  try {
    await fal.subscribe('fal-ai/minimax/speech-02-hd', { input });
    console.log('OK', t.label, JSON.stringify(input.voice_setting));
  } catch (e) {
    console.log('FAIL', t.label, e.message, JSON.stringify(e.body)?.slice(0, 400));
  }
}
