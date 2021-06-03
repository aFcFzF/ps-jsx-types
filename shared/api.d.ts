/**
 * @file api.d.ts
 * @author afcfzf(9301462@qq.com)
 */

enum TextExportType {
    // 按相同格式分组
    RANGE = 'range',

    // 按行分组
    LINE = 'line',

    // 纯文本
    PLAIN_TEXT = 'plain_text'
}

export interface IOnProgress {
    psdId: number;
    current: number;
    total: number;
    layerName: string;
    layerType: LayerType;
}

export interface IOnFinish {
    psdId: number;
}

export interface IOnError {
    psdId: number;
    layerName: string;
    layerType: LayerType;
    msg: string;
}

type IGetPsdDataOptions = Partial<{
    text: Partial<{
        // 文本导出类型
        exportType: TextExportType;

        // 栅格化 默认 false
        raster: boolean;

        // 栅格化前缀标识 eg: --raster--xxxx
        rasterPrefix: string;

        // 不栅格化前缀标识 eg: --no-raster--xxxx
        noRasterPrefix: string;
    }>;

    group: Partial<{
        /*
         * 保留组层级 default 0
         * -1 保留所有组（ps限制，组最大嵌套10级）
         *  0 合并顶层组为单独图层
         *  1 合并顶层组下的所有组
         */
        depth: number;

        // -1 全部不合并
        //  0 全部合并
        //  1 表示第一层的组和图层不进行合并 default 1
        merge: number;

        // 保留文本层, default: true
        retainTextLayer: boolean;

        // 合并前缀标识，默认 --merge--xxxx
        mergePrefix: string;

        // 不进行合并前缀标识，默认 --no-merge--xxxx
        noMergePrefix: string;

        // 背景图 + 颜色，默认 --group-bg--#xxx
        bgLayerPrefix: string;
    }>;

    // 事件名定义
    event: Partial<{
        // 处理进度: IOnProgress;
        onProgress: 'getPsdData.onProgress';

        // 完成: IOnFinish
        onFinish: 'getPsdData.onFinish';

        // 错误: IOnError
        onError: 'getPsdData.onError';
    }>;
}>;

// 层类型
export enum LayerType {
    GROUP = 'group',
    IMAGE = 'image',
    TEXT = 'text',
    TEXTAREA = 'textarea'
}

export interface ILayerBase {
    // 图层名
    name: string;

    // 位置
    top: number;

    left: number;

    // 尺寸
    height: number;

    width: number;

    // 是否锁定图层
    locked: boolean;

    // 是否可见
    visible: boolean;

    // 透明度
    opacity: number;
}

// 文本样式
export type TextAttribute = Partial<{
    bold: boolean;
    underline: boolean;
    font: string;
    lineHeight: number;
    size: number;
    color: string;
    background: string;
}>;

export interface ITextRange {
    text: string;
    attributes?: TextAttribute[];
}

// 组类型
export interface IGroupLayer extends ILayerBase {
    type: LayerType.GROUP;

    // 类型为组时，所包含的子元素
    children: ILayerData[];
}

// 位图类型
export interface IImageLayer extends ILayerBase {
    type: LayerType.IMAGE;

    // 位图、文本位图 路径
    filePath: string;
}

// 文本类型
export interface ITextLayer extends ILayerBase {
    type: LayerType.TEXT;

    content: ITextRange;
}

// 多行文本类型
export interface ITextareaLayer extends ILayerBase {
    type: LayerType.TEXTAREA;

    content: ITextRange[];
}

export type ILayerData = IGroupLayer | IImageLayer | ITextLayer | ITextareaLayer;

export interface IPsdData {
    name: string; // '未标题-1.psd'

    path: string; // '~/Documents/未标题-1.psd'

    height: number;

    width: number;

    children?: ILayerData[];
}

// test
const fn = (psdData: IPsdData) => {
    const {children} = psdData;

    if (!children) {
        return;
    }

    for (const item of children) {
        switch (item.type) {
            case LayerType.GROUP: {
                $.writeln(item.children);
                break;
            }

            case LayerType.IMAGE: {
                $.writeln(item.filePath);
                break;
            }

            case LayerType.TEXT: {
                $.writeln(item.content);
            }
        }
    }
};

// extendscript 整体api参数，openFile（自动打开目录）、closeFile、dupDocs
// DocumentInfo

// 执行结果
export interface IOperationResponse<T> {
    // 状态码 0 成功, -1 失败
    code: number;

    // 失败原因
    msg: string;

    // 数据
    data: T;
}

// 获取psd结构 * 注意调研能否获取Document，还是只能通过id获取
type getPsdData = (id: number, options?: IGetPsdDataOptions) => IOperationResponse<IPsdData>;

// 获取当前激活的psdId
type getActivePsd = () => IOperationResponse<number>;

// 获取当前打开的psdId
type getOpenedPsds = () => IOperationResponse<number[]>;

// 打开psd文件, 返回id. 打开方式：兼容版本、字体丢失等问题？
type openPsd = (path: string, options: OpenOptions) => IOperationResponse<number>;

// 关闭打开的psd
type closePsd = (id: number) => IOperationResponse<null>;

// 复制打开psd, 返回新的psdId
type duplicatePsd = (id: number) => IOperationResponse<number>;

// 激活已打开的psd
type activePsd = (id: number) => IOperationResponse<null>;
