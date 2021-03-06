// // tslint:disable max-classes-per-file
// // tslint:disable no-empty-interface
import {inject, injectable} from 'inversify';
import {log} from '../../../app/core/log'
import {
    IProficiencyStats,
    ISubscribableMutableField,
    ISubscribableTreeUser,
    ITreeUserData,
    IValUpdates,
} from '../interfaces';
import {Subscribable} from '../subscribable/Subscribable';
import {TYPES} from '../types'

@injectable()
export class SubscribableTreeUser extends Subscribable<IValUpdates> implements ISubscribableTreeUser {
    private publishing = false
    public proficiencyStats: ISubscribableMutableField<IProficiencyStats>;
    public aggregationTimer: ISubscribableMutableField<number>;

    // TODO: should the below three objects be private?
    public val(): ITreeUserData {
        return {
            proficiencyStats: this.proficiencyStats.val(),
            aggregationTimer: this.aggregationTimer.val(),
        }
    }
    constructor(@inject(TYPES.SubscribableTreeUserArgs) {
        updatesCallbacks, proficiencyStats, aggregationTimer
    }: SubscribableTreeUserArgs) {
        super({updatesCallbacks})
        this.proficiencyStats = proficiencyStats
        this.aggregationTimer = aggregationTimer
    }
    // TODO: make IValUpdates a generic that takes for example ITreeUserData
    protected callbackArguments(): IValUpdates {
        return this.val()
    }
    public startPublishing() {
        if (this.publishing) {
            return
        }
        this.publishing = true
        const boundCallCallbacks = this.callCallbacks.bind(this)
        this.proficiencyStats.onUpdate(boundCallCallbacks)
        this.aggregationTimer.onUpdate(boundCallCallbacks)
    }
}

@injectable()
export class SubscribableTreeUserArgs {
    @inject(TYPES.Array) public updatesCallbacks
    @inject(TYPES.ISubscribableMutableProficiencyStats)
        public proficiencyStats: ISubscribableMutableField<IProficiencyStats>
    @inject(TYPES.ISubscribableMutableNumber) public aggregationTimer: ISubscribableMutableField<number>
}
