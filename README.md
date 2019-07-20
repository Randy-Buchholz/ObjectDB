# ObjectDB
Simple async/await Storage of Typed Objects in IndexDB

## Background
ES Native Modules provide a way to work with ES classes in a more familiar way. A primary difference between classes in languages like C# and ES classes
is that ES classes have no "self awareness". Native Modules provide a container for classes and allow the addition of meta-data to provide some level of self-awareness.

Wrapping ES classes in modules using a simple pattern allows us to reflect on these classes to get their type.

```
export { ClassName };
export default class ClassName {
    type = import.meta.url;
    static type = import.meta.url;
    
    // Class definition
}
```
We can capture the type of an object when storing it in IndexDB, and reconstruct the object as a typed object when we retrieve it. 

```
<script type="module">
    import { ObjectDB, OpenMode } from "/ObjectDB.mjs";
    import { Person } from "/Person.mjs";

    (async () => {

        const db = new ObjectDB({database: "NewDb", dataset: "Messages"});

        const joe = Object.assign(new Person(), {
            name: "Joe",
            age: 45
        });

        await db.writeAsync("joe", joe);

        const retreive = await db.readAsync("joe");
        console.log({retreive});
        
        console.log(retreive instanceof Person);

    })();
</script>
```

