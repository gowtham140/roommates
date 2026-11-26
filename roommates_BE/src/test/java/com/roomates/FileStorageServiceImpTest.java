package com.roomates;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import com.roomates.serviceImp.FileStorageServiceImp;

class FileStorageServiceImpTest {

    @TempDir
    Path uploadDir;

    @Test
    void deleteRemovesUploadedImageFromAssets() throws Exception {
        Path roomDir = Files.createDirectories(uploadDir.resolve("rooms"));
        Path image = Files.createFile(roomDir.resolve("a.png"));
        FileStorageServiceImp service = new FileStorageServiceImp(uploadDir.toString());

        service.delete("/uploads/rooms/a.png");

        assertFalse(Files.exists(image));
    }

    @Test
    void deleteIgnoresPathsOutsideRoomAssets() throws Exception {
        Path image = Files.createFile(uploadDir.resolve("secret.png"));
        FileStorageServiceImp service = new FileStorageServiceImp(uploadDir.toString());

        service.delete("/uploads/rooms/..");

        assertTrue(Files.exists(image));
    }
}
