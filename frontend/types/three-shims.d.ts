// three không kèm type cho hai entry WebGPU/TSL (kit liquid-glass dùng cho Checkbox).
// `three` gốc vẫn chưa có .d.ts cho hai đường dẫn này, nên khai báo shim ở đây để tsc không
// báo TS7016. Kit đã tự bọc `any` cho các node của shader, nên kiểu any là đủ.
declare module 'three/webgpu';
declare module 'three/tsl';
