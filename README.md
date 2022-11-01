# SportDetect Endpoint Utility
A request generation utility for the SportDetect APIs.

## Installation
You can install this library using `npm`, it's available as the `@sportdetect/endpoint` package.
```shell
npm install @sportdetect/endpoint
```

## Usage
This library only has a single export called `endpoint` which can be used to generate request URLs.
```js
import endpoint from "@sportdetect/endpoint"
// ... or
const endpoint = require('@sportdetect/endpoint').default
```

You can chain all the transforms to create a complex query, like this:
```js
endpoint('events')
    .property('season_id').equals(18820)
    .or(
        obj => obj
            .property('away_team_score->current').greaterThan(3)
            .property('home_team_score->current').greaterThan(3)
    )
    .select('away_team_id', 'home_team_id', 'away_team_score', 'home_team_score')
    .order(o => o.property('id').descending)
// events?season_id=eq.18820&or=(away_team_score->current.gt.3,home_team_score->current.gt.3)&select=away_team_id,home_team_id,away_team_score,home_team_score&order=id.desc
```

### `endpoint(name)`
Creates an object that is associated with an endpoint.
```js
endpoint('events')
```
### `toString()`
Turns an endpoint object to a string.
```js
endpoint('events').toString()
```

## Response Transforms

### `offset(value)`
Skips `value` amount of elements.
```js
endpoint('events').offset(1)
// events?offset=1
```

### `limit(value)`
Limits the response to `value` amount of objects.
```js
endpoint('events').limit(1)
// events?limit=1
```

### `select(...props)`
Makes the returned object only contain the selected properties.
```js
endpoint('events').select('home_team_id', 'away_team_id')
// events?select=home_team_id,away_team_id
```

## Property Transforms
> All the property transforms can be negated using the `not.` prefix.
> ```js
> endpoint('events').property('id').not.lessThan(10)
> // events?id=not.lt.10
> ```

### `property(name)`
Applies a transform using a property.
```js
endpoint('events').property('id').lessThan(10)
// events?id=lt.10
```

### `equals(value)`
Checks if a property is equal to `value`.
```js
endpoint('events').property('id').equals(10)
// events?id=eq.10
```

### `greaterThan(value)`
Checks if a property is greater than `value`.
```js
endpoint('events').property('id').greaterThan(10)
// events?id=gt.10
```

### `greaterThanOrEqual(value)`
Checks if a property is greater than or equal to `value`.
```js
endpoint('events').property('id').greaterThanOrEqual(10)
// events?id=gte.10
```

### `lessThan(value)`
Checks if a property is less than `value`.
```js
endpoint('events').property('id').lessThan(10)
// events?id=lt.10
```

### `lessThanOrEqual(value)`
Checks if a property is less than or equal to `value`.
```js
endpoint('events').property('id').lessThanOrEqual(10)
// events?id=lte.10
```

### `like(exp)`
Checks if a property matches a glob expression.
```js
endpoint('players').property('first_name').like('A*')
// players?first_name=like.A*
```

### `insensitive.like(exp)`
Checks if a property matches a glob expression (case insensitive).
```js
endpoint('players').property('first_name').insensitive.like('A*')
// players?first_name=ilike.A*
```

### `match(exp)`
Checks is a property matches a POSIX regular expression.
```js
endpoint('players').property('first_name').match('^A')
// players?first_name=match.^A
```

### `insensitive.match(exp)`
Checks is a property matches a POSIX regular expression.
```js
endpoint('players').property('first_name').insensitive.match('^A')
// players?first_name=imatch.^A
```

### `in(...values)`
Checks if the property is inside the array `value`.
```js
endpoint('events').property('id').in(1, 2, 3)
// events?id=in.(1,2,3)
```

### `is(value)`
Checks if the property is exactly equal to `value`.
```js
endpoint('events').property('id').is('null')
// events?id=is.null
```


## Logical Transforms
> All the logical transforms can be negated with the `not.` prefix.
> ```js
> endpoint('events').not.or(
>     obj => obj
>         .property('id').lessThan(10)
>         .property('id').not.equals(1)
> )
> // events?not.or=(id.lt.10,id.not.eq.1)
> ```

### `and(fn)`
Combines the transforms using the logical `and` operator.
```js
endpoint('events').and(
    obj => obj
        .property('id').lessThan(10)
        .property('id').not.equals(1)
)
// events?and=(id.lt.10,id.not.eq.1)
```

### `or(fn)`
Combines the transforms using the logical `or` operator.
```js
endpoint('events').or(
    obj => obj
        .property('id').lessThan(10)
        .property('id').not.equals(1)
)
// events?or=(id.lt.10,id.not.eq.1)
```


## Sort Transforms

### `order(fn)`
Applies a sorting transform.
```js
endpoint('events').order(
    obj => obj
        .property('id')
        .ascending
)
// events?order=id.asc
```

### `property(name)`
Applies a sorting transform using a property.
```js
endpoint('events').order(
    obj => obj
        .property('id')
        .ascending
)
// events?order=id.asc
```

### `ascending`
Sorts the returned objects in ascending order based on a property.
```js
endpoint('events').order(
    obj => obj
        .property('id').ascending
)
// events?order=id.asc
```

### `descending`
Sorts the returned objects in descending order based on a property.
```js
endpoint('events').order(
    obj => obj
        .property('id').descending
)
// events?order=id.desc
```

### `nullsFirst`
Makes the null values appear first.
```js
endpoint('events').order(
    obj => obj
        .property('id').ascending
        .property('id').nullsFirst
)
// events?order=id.asc.nullsfirst
```

### `nullsLast`
Makes the null values appear last.
```js
endpoint('events').order(
    obj => obj
        .property('id').descending
        .property('id').nullsLast
)
// events?order=id.desc.nullslast
```

