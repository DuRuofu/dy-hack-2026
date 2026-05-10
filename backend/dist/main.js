"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: ['http://localhost:5173'],
        methods: ['GET', 'POST', 'PUT'],
        credentials: false,
    });
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'db'), { prefix: '/' });
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map