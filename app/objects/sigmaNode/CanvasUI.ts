// tslint:disable max-classes-per-file
// map from treeId to sigmaNodeId
// map from contentId to sigmaNodeId
// in the class that creates an instance of CanvasUI
// subscribe to stores. on stores update parse object type and id
// and get the correct tree id from either those two properties or from the result of a map lookup

import {inject, injectable} from 'inversify';
import {ISigmaNodeHandler, ITypeAndIdAndValUpdates} from '../interfaces';
import {ISubscribable, IUI} from '../interfaces';
import {TYPES} from '../types';

@injectable()
class CanvasUI implements IUI  {
    private sigmaNodeHandler: ISigmaNodeHandler

    constructor(@inject(TYPES.CanvasUIArgs){sigmaNodeHandler}) {
        this.sigmaNodeHandler = sigmaNodeHandler
    }
    public subscribe(obj: ISubscribable<ITypeAndIdAndValUpdates>) {
        obj.onUpdate(this.sigmaNodeHandler.handleUpdate.bind(this.sigmaNodeHandler))
    }
}

@injectable()
class CanvasUIArgs {
    @inject(TYPES.ISigmaNodeHandler) public sigmaNodeHandler
}

export {CanvasUI, CanvasUIArgs}