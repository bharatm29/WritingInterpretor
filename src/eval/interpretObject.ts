export enum ObjectType {
    INT_OBJ = "INTEGER",
    BOOL_OBJ = "BOOLEAN",
    NULL_OBJ = "NULL",
    RETURN_OBJ = "RETURN_VAL",
    ERROR_OBJ = "ERROR",
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

export class ReturnValue implements InterpretObject {
    constructor(public value: InterpretObject,) { }

    type(): ObjectType {
        return ObjectType.RETURN_OBJ;
    }
    inspect(): string {
        return this.value.inspect();
    }
}

export class Error implements InterpretObject {
    constructor(public message: string) { }

    type(): ObjectType {
        return ObjectType.ERROR_OBJ;
    }
    inspect(): string {
        return "ERROR: " + this.message;
    }
}

export class Environment {
    public store: Map<String, InterpretObject>;

    constructor() {
        this.store = new Map();
    }

    get(name: string): InterpretObject | undefined {
        return this.store.get(name);
    }

    set(name: string, val: InterpretObject): InterpretObject {
        this.store.set(name, val);

        return val;
    }
}

export function newEnvironment() {
    return new Environment();
}
