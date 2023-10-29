/**
 * Copyright 2023 Kapeta Inc.
 * SPDX-License-Identifier: MIT
 */

export function formatBytes(bytes: number): string {
    const KB_SIZE = 1024;
    const MB_SIZE = KB_SIZE * 1000;
    const GB_SIZE = MB_SIZE * 1000;

    if (bytes < KB_SIZE) {
        return `${bytes} b`;
    }

    if (bytes < MB_SIZE) {
        return `${Math.ceil(bytes / KB_SIZE)} Kb`;
    }

    if (bytes < GB_SIZE) {
        return `${Math.ceil(bytes / MB_SIZE)} Mb`;
    }

    return `${Math.ceil(bytes / GB_SIZE)} Gb`;
}

export function getFileExtension(name: string) {
    const fileNameParts = name.split(/\./g);
    return '.' + fileNameParts[fileNameParts.length - 1].toLowerCase();
}
