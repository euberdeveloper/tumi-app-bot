import * as path from 'path';
import * as moduleAlias from 'module-alias';

moduleAlias.addAlias('@', path.join(process.cwd(), 'dist', 'scripts', 'source'));
moduleAlias.addAlias('@scripts', path.join(process.cwd(), 'dist', 'scripts', 'scripts'));
