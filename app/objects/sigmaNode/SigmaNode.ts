// tslint:disable max-classes-per-file
import {inject, injectable} from 'inversify';
import {ContentItemUtils} from '../contentItem/ContentItemUtils';
import {IContentData} from '../contentItem/IContentData';
import {ContentUserDataUtils} from '../contentUserData/ContentUserDataUtils';
import {IContentUserData} from '../contentUserData/IContentUserData';
import {ICoordinate, IPoint} from '../point/IPoint';
import {IProficiencyStats} from '../proficiencyStats/IProficiencyStats';
import {IBasicTree} from '../tree/IBasicTree';
import {IBasicTreeData, IBasicTreeDataWithoutId} from '../tree/IBasicTreeData';
import {ITreeUserData} from '../treeUserData/ITreeUserData';
import {TYPES} from '../types';
import {IColorSlice} from './IColorSlice';
import {IEditableSigmaNode} from './IEditableSigmaNode';
import {ISigmaNode} from './ISigmaNode';
import {ISigmaNodeData} from './ISigmaNodeData';
import {SigmaNodeUtils} from './SigmaNodeUtils';

@injectable()
class SigmaNode implements ISigmaNode {
    public receiveNewTreeData(tree: IBasicTreeDataWithoutId) {
        this.parentId = tree.parentId
        this.contentId = tree.contentId
        this.children = tree.children
    }
    public receiveNewTreeUserData(treeUserData: ITreeUserData) {
        this.colorSlices = SigmaNodeUtils.getColorSlicesFromProficiencyStats(treeUserData.proficiencyStats)
        this.aggregationTimer = treeUserData.aggregationTimer
        this.proficiencyStats = treeUserData.proficiencyStats
    }
    public receiveNewContentData(contentData: IContentData) {
        this.label = ContentItemUtils.getLabelFromContent(contentData)
        this.content = contentData
    }

    public receiveNewContentUserData(contentUserData: IContentUserData) {
        this.overdue = contentUserData.overdue
        this.size = ContentUserDataUtils.getSizeFromContentUserData(contentUserData)
        this.contentUserData = contentUserData
    }

    public receiveNewTreeLocationData(treeLocationData: ICoordinate) {
        this.x = treeLocationData.x
        this.y = treeLocationData.y
    }
    /* TODO: this class shouldn't have a reference to sigma instance.
     But whatever class (SigmaNodesHandlers?) that has acccess to the instance
      of this class should call sigmaInstance.refresh() after an update is called on this class
      */

    public id: string;
    public parentId: string;
    public contentId: string;
    public children: string[];
    public x: number;
    public y: number;
    public aggregationTimer: number;
    public content: IContentData;
    public contentUserData: IContentUserData;
    public label: string;
    public size: number;
    public colorSlices: IColorSlice[];
    public proficiencyStats: IProficiencyStats;
    public overdue: boolean;

    constructor(@inject(TYPES.SigmaNodeArgs)
        {
            id,
            parentId,
            contentId,
            children,
            x,
            y,
            content,
            contentUserData,
            label,
            size,
            aggregationTimer,
            colorSlices,
            overdue
        }) {
        this.id = id
        this.parentId = parentId
        this.contentId = contentId
        this.children = children
        this.x = x
        this.y = y
        this.contentUserData = contentUserData
        this.aggregationTimer = aggregationTimer
        this.content = content
        this.label = label
        this.size = size
        this.colorSlices = colorSlices
        this.overdue = overdue
    }
}

@injectable()
class SigmaNodeArgs {
    @inject(TYPES.String) public id: string;
    @inject(TYPES.String) public parentId: string;
    @inject(TYPES.String) public contentId: string;
    @inject(TYPES.String) public children: string;
    @inject(TYPES.Number) public x: number;
    @inject(TYPES.Number) public y: number;
    @inject(TYPES.Object) public content: object;
    @inject(TYPES.String) public label: string;
    @inject(TYPES.Number) public size: number;
    @inject(TYPES.IContentUserData) public contentUserData: IContentUserData;
    @inject(TYPES.Number) public aggregationTimer: number;
    @inject(TYPES.IProficiencyStats) public proficiencyStats: IProficiencyStats;
    @inject(TYPES.IColorSlice) public colorSlices: IColorSlice[];
    @inject(TYPES.String) public overdue: boolean;
}

export {SigmaNode, SigmaNodeArgs}