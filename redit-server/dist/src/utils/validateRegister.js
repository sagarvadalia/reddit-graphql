"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
exports.validateRegister = (options) => {
    if (options.username.length <= 2) {
        return [
            {
                field: 'username',
                message: 'length must be greater than 2 characters',
            },
        ];
    }
    if (!options.email.includes('@')) {
        return [
            {
                field: 'email',
                message: 'invalid email',
            },
        ];
    }
    if (options.username.includes('@')) {
        return [
            {
                field: 'username',
                message: 'username cannot include @ character',
            },
        ];
    }
    return null;
};
//# sourceMappingURL=validateRegister.js.map