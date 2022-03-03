import * as path from 'path';
import * as moduleAlias from 'module-alias';

moduleAlias.addAlias('@', path.join(process.cwd(), 'dist', 'bot'));
