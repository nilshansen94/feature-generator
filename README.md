# Getting Started With Schematics

This schematic generates a pure component and it's container and if specified also a service.\
Example: \
`ng g feature:feature --name abc`\
This leads to the following file structure:

```
abc/
├── component/
│   ├── abc.component.scss
│   ├── abc.component.html
│   └── abc.component.ts
├── container/
│   └── abc-container.component.ts
├── service/
│   └── abc.service.ts
└── specs/
    ├── abc.component.spec.ts
    ├── abc-container.component.spec.ts
    ├── abc.service.spec.ts
    └── abc.component.stories.ts
```

## How to run the schematic

1. Pull this repository.
2. run `npm install`
2. In this repository:
   1. run `npm run build`
   2. only once: `npm link`
3. In you angular project:
   1. only once: `npm link feature`
   2. `ng g feature:feature --name abc`

If you modify the schematic, it is sufficient to run `npm run build` in the schematic, and then you can test the schematic in your angular
project by simply executing again the `ng g feature:feature --name abc` command.