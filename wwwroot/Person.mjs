export { Person };
export default class Person {
    static type = import.meta.url;
    meta = {
        type: import.meta.url,
        name: import.meta.url.split(".")[0].split("/").pop()
    };

    name;
    age;
}