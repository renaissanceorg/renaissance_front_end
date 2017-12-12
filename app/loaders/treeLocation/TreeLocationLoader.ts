import {inject, injectable} from 'inversify';
import {log} from '../../../app/core/log'
import {
    IMutableSubscribableTreeLocation, ISubscribableStoreSource, ITreeLocationData,
    ITreeLocationLoader
} from '../../objects/interfaces';
import {isValidTreeLocation} from '../../objects/tree/treeValidator';
import {TYPES} from '../../objects/types';
import {TreeLocationDeserializer} from './TreeLocationDeserializer';

@injectable()
export class TreeLocationLoader implements ITreeLocationLoader {
    private store: ISubscribableStoreSource<IMutableSubscribableTreeLocation>
    private firebaseRef
    constructor(@inject(TYPES.TreeLocationLoaderArgs){firebaseRef, store}) {
        this.store = store
        this.firebaseRef = firebaseRef
    }

    public getData(treeId): ITreeLocationData {
        if (!this.store.get(treeId)) {
            throw new RangeError(treeId + ' does not exist in TreeLocationLoader store. Use isLoaded(treeId) to check.')
        }
        return this.store.get(treeId).val()
        // TODO: fix violoation of law of demeter
    }

    // TODO: this method violates SRP.
    // it returns data AND has the side effect of storing the data in the store
    public async downloadData(treeId): Promise<ITreeLocationData> {
        const me = this
        return new Promise((resolve, reject) => {
            this.firebaseRef.on('value', (snapshot) => {
                const treeLocationData: ITreeLocationData = snapshot.val()
                if (isValidTreeLocation(treeLocationData)) {
                    const tree: IMutableSubscribableTreeLocation =
                        TreeLocationDeserializer.deserialize({treeLocationData})
                    me.store.set(treeId, tree)
                    resolve(treeLocationData)
                } else {
                    reject(treeLocationData)
                }
            })
        }) as Promise<ITreeLocationData>
    }

    public isLoaded(treeId): boolean {
        return !!this.store.get(treeId)
    }

}
@injectable()
export class TreeLocationLoaderArgs {
    @inject(TYPES.Firebase) public firebaseRef
    @inject(TYPES.ISubscribableStoreSource) public store: ISubscribableStoreSource<IMutableSubscribableTreeLocation>
}