import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';

// Les assertions asynchrones partent d'un délai d'une seconde, calibré pour une
// machine libre. La suite crée un environnement jsdom par fichier et les lance en
// parallèle : sous cette charge, un rendu qui attend deux réponses d'API — la
// session, puis les données — dépasse ce délai et échoue sans que le code soit
// fautif. Le délai est allongé, pas la condition assouplie.
configure({ asyncUtilTimeout: 5000 });
