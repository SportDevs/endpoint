type OrderProperty = string
interface OrderSortedKeysValue {
    ascending?: boolean
    descending?: boolean,
    nullsLast?: boolean,
    nullsFirst?: boolean
}
type OrderSortedKeys = { [key :OrderProperty]: OrderSortedKeysValue }

interface OrderPropertyOperations {
    get descending(): OrderObject,
    get ascending(): OrderObject,
    get nullsFirst(): OrderObject,
    get nullsLast(): OrderObject
}

interface OrderObject {
    toString(): string,
    property(prop: OrderProperty): OrderPropertyOperations
}

function orderTable() : OrderObject {
    const sortedKeys : OrderSortedKeys = {}
    const obj = {
        property: (prop: OrderProperty) => {
            sortedKeys[prop] ??= {}
            return {
                get descending() {
                    sortedKeys[prop].ascending = false
                    sortedKeys[prop].descending = true
                    return obj
                },
                get ascending() {
                    sortedKeys[prop].descending = false
                    sortedKeys[prop].ascending = true
                    return obj
                },
                get nullsFirst() {
                    sortedKeys[prop].nullsLast = false
                    sortedKeys[prop].nullsFirst = true
                    return obj
                },
                get nullsLast() {
                    sortedKeys[prop].nullsLast = true
                    sortedKeys[prop].nullsFirst = false
                    return obj
                }
            }
        },
        toString() {
            const arr = []
            for (const [key, value] of Object.entries(sortedKeys).filter(x => !Object.values(x[1]).every(x => !x))) {
                let str = key
                if (value.ascending) {
                    str += '.asc'
                }
                if (value.descending) {
                    str += '.desc'
                }
                if (value.nullsLast) {
                    str += '.nullslast'
                }
                if (value.nullsFirst) {
                    str += '.nullsfirst'
                }
                arr.push(str)
            }
            return arr.join(',')
        }
    }
    return obj
}

type StringValue = string|{ toString(): string };
type EndpointParam = [string, string]
type EndpointParams = EndpointParam[]

type LogicalOperator = (fn: (obj: EndpointObject) => EndpointObject) => EndpointObject
type ArrayOperator = (...args: StringValue[]) => EndpointObject
type FlatOperator = (value: StringValue) => EndpointObject
type OrderOperator = (fn: (obj: OrderObject) => OrderObject) => EndpointObject

type PropertyOperator = (prop: StringValue) => PropertyOperations

interface EndpointObject {

    toString(complex?: boolean): string
    not: {
        and: LogicalOperator,
        or: LogicalOperator
    },
    and: LogicalOperator,
    or: LogicalOperator,
    select: ArrayOperator,
    limit: FlatOperator,
    offset: FlatOperator,
    order: OrderOperator,
    property: PropertyOperator
}


interface PropertyOperations {
    not: {
        equals: FlatOperator,
        greaterThan: FlatOperator,
        greaterThanOrEqual: FlatOperator,
        lessThan: FlatOperator,
        lessThanOrEqual: FlatOperator,
        like: FlatOperator,
        match: FlatOperator,
        insensitive: {
            like: FlatOperator,
            match: FlatOperator,
        },
        in: ArrayOperator,
        is: FlatOperator
    },
    equals: FlatOperator,
    greaterThan: FlatOperator,
    greaterThanOrEqual: FlatOperator,
    lessThan: FlatOperator,
    lessThanOrEqual: FlatOperator,
    like: FlatOperator,
    match: FlatOperator,
    insensitive: {
        like: FlatOperator,
        match: FlatOperator,
    },
    in: ArrayOperator,
    is: FlatOperator
}

export default function endpoint(name : StringValue) {
    const params : EndpointParams = []

    const operator = (op : StringValue, prop : StringValue) => {
        return (value: StringValue) => {
            params.push([`${prop.toString()}`, `${op.toString()}.${value.toString()}`])
            return obj
        }
    }

    const arrayOperator = (op : StringValue, prop : StringValue, fmt : (value: string) => string, separator = ',') => {
        return (...value: StringValue[]) => {
            const formatted = fmt(value.map(x => x.toString()).join(separator))
            params.push([`${prop.toString()}`, `${op.toString()}.${formatted}`])
            return obj
        }
    }

    const logicalOperator = (op : StringValue) => {
        return (fn: (obj: EndpointObject) => EndpointObject) => {
            const result : string = fn(endpoint('')).toString(true)
            params.push([`${op.toString()}`, `${result}`])
            return obj
        }
    }

    const obj : EndpointObject = {
        not: {
            and: logicalOperator('not.and'),
            or: logicalOperator('not.or'),
        },
        and: logicalOperator('and'),
        or: logicalOperator('or'),
        select(...value: StringValue[]) {
            params.push([`select`, `${value.map(x => x.toString()).join(',')}`])

            return obj
        },
        limit(amount) {
            params.push([`limit`, amount.toString()])
            return obj
        },
        offset(amount) {
            params.push([`offset`, amount.toString()])
            return obj
        },
        order(fn) {
            params.push([`order`, fn(orderTable()).toString()])
            return obj
        },
        property(prop: StringValue) {
            return {
                not: {
                    equals: operator('not.eq', prop),
                    greaterThan: operator('not.gt', prop),
                    greaterThanOrEqual: operator('not.gte', prop),
                    lessThan: operator('not.lt', prop),
                    lessThanOrEqual: operator('not.lte', prop),
                    like: operator('not.like', prop),
                    match: operator('not.match', prop),
                    insensitive: {
                        like: operator('not.ilike', prop),
                        match: operator('not.imatch', prop),
                    },
                    in: arrayOperator('not.in', prop, value => `(${value})`),
                    is: operator('not.is', prop)
                },
                equals: operator('eq', prop),
                greaterThan: operator('gt', prop),
                greaterThanOrEqual: operator('gte', prop),
                lessThan: operator('lt', prop),
                lessThanOrEqual: operator('lte', prop),
                like: operator('like', prop),
                match: operator('match', prop),
                insensitive: {
                    like: operator('ilike', prop),
                    match: operator('imatch', prop),
                },
                in: arrayOperator('in', prop, value => `(${value})`),
                is: operator('is', prop)
            }
        },
        toString(complex = false) {
            if (complex) {
                return `(${params.map(x => x.join('.')).join(',')})`.replaceAll('.(', '(')
            }
            return name + '?' + params.map(x => x.join('=')).join('&')
        }
    }
    return obj
}

