export enum ObjectType {
    INT_OBJ = "Int_obj",
    BOOL_OBJ = "Bool_obj",
    NULL_OBJ = "Null_obj",
}

export interface InterpretObject {
    type(): ObjectType;
    inspect(): string;
}

export class Integer implements InterpretObject {
    constructor(public value: number) { }

    type(): ObjectType {
        return ObjectType.INT_OBJ;
    }
    inspect(): string {
        return this.value.toString();
    }
}

export class Boolean implements InterpretObject {
    constructor(public value: boolean) { }

    type(): ObjectType {
        return ObjectType.BOOL_OBJ;
    }
    inspect(): string {
        return this.value.toString();
    }
}

export class Null implements InterpretObject {
    type(): ObjectType {
        return ObjectType.NULL_OBJ;
    }
    inspect(): string {
        return "Null";
    }
}
