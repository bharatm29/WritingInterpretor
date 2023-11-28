import { BlockStatement, Identifier } from "../ast/ast";

export enum ObjectType {
    INT_OBJ = "INTEGER",
    BOOL_OBJ = "BOOLEAN",
    NULL_OBJ = "NULL",
    RETURN_OBJ = "RETURN_VAL",
    ERROR_OBJ = "ERROR",
    FUNCTION_OBJ = "FUNCTION",
    STRING_OBJ = "STRING",
    BUILTIN_OBJ = "BUILTIN",
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
    public outer?: Environment;

    constructor() {
        this.store = new Map();
    }

    get(name: string): InterpretObject | undefined {
        const val = this.store.get(name);

        if (!val && this.outer) {
            return this.outer.get(name);
        }

        return val;
    }

    set(name: string, val: InterpretObject): InterpretObject {
        this.store.set(name, val);

        return val;
    }
}

export function newEnvironment(): Environment {
    return new Environment();
}

export function newEnclosedEnvironment(outer: Environment): Environment {
    const env = new Environment();
    env.outer = outer;

    return env;
}

export class FunctionObj implements InterpretObject {
    constructor(
        public parameters: Identifier[],
        public body: BlockStatement,
        public env: Environment
    ) { }

    type(): ObjectType {
        return ObjectType.FUNCTION_OBJ;
    }
    inspect(): string {
        let st = "";

        const params: string = this.parameters.map(p => p.string()).join(",");

        st += `fn`;
        st += `(`;
        st += params;
        st += `){\n`;

        st += this.body.string() + "\n}";

        return st;
    }
}

export class StringObj implements InterpretObject {
    constructor(
        public value: string,
    ) {}

    inspect(): string {
        return this.value;
    }

    type(): ObjectType {
        return ObjectType.STRING_OBJ;
    }

}

export class Builtin implements InterpretObject {
    constructor(
        public builtinFunction: Function,
    ) {}

    inspect(): string {
        return "builtin function";
    }

    type(): ObjectType {
        return ObjectType.BUILTIN_OBJ;
    }
}

export const builtins: Map<string, Builtin> = new Map();
builtins.set("len", new Builtin(
    (...args: InterpretObject[]): InterpretObject => {
        if (args.length !== 1){
            return new Error(`wrong number of arguments. got=${args.length}, want=1`);
        }

        switch (args[0].constructor.name) {
            case "StringObj":
                return new Integer((args[0] as StringObj).value.length);
            default:
                return new Error(`argument to len not supported, got ${args[0].type()}`);
        }
    }
));