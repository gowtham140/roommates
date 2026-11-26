package com.roomates;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import com.roomates.exception.BadRequestException;
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

    @Test
    void storeRejectsFilesWithoutImageMagicBytes() {
        MockMultipartFile file = new MockMultipartFile("files", "fake.png", "image/png",
                "not really a png".getBytes());
        FileStorageServiceImp service = new FileStorageServiceImp(uploadDir.toString());

        assertThrows(BadRequestException.class, () -> service.store(List.of(file)));
    }

    @Test
    void storeValidatesEveryFileBeforeWritingAnything() throws Exception {
        Path roomDir = Files.createDirectories(uploadDir.resolve("rooms"));
        MockMultipartFile valid = new MockMultipartFile("files", "a.png", "image/png", pngBytes());
        MockMultipartFile invalid = new MockMultipartFile("files", "b.png", "image/png", "bad".getBytes());
        FileStorageServiceImp service = new FileStorageServiceImp(uploadDir.toString());

        assertThrows(BadRequestException.class, () -> service.store(List.of(valid, invalid)));
        try (Stream<Path> files = Files.list(roomDir)) {
            assertEquals(0L, files.count());
        }
    }

    @Test
    void storeCleansUpFilesWrittenBeforeAFailure() throws Exception {
        Path roomDir = Files.createDirectories(uploadDir.resolve("rooms"));
        MockMultipartFile valid = new MockMultipartFile("files", "a.png", "image/png", pngBytes());

        MultipartFile failing = mock(MultipartFile.class);
        when(failing.isEmpty()).thenReturn(false);
        when(failing.getSize()).thenReturn(12L);
        when(failing.getContentType()).thenReturn("image/png");
        when(failing.getOriginalFilename()).thenReturn("b.png");
        when(failing.getInputStream())
                .thenReturn(new ByteArrayInputStream(pngBytes()))
                .thenThrow(new IOException("cannot read on write"));

        FileStorageServiceImp service = new FileStorageServiceImp(uploadDir.toString());

        assertThrows(IllegalStateException.class, () -> service.store(List.of(valid, failing)));
        try (Stream<Path> files = Files.list(roomDir)) {
            assertEquals(0L, files.count());
        }
    }

    @Test
    void storeAcceptsFileWithMatchingImageMagicBytes() {
        MockMultipartFile file = new MockMultipartFile("files", "a.png", "image/png", pngBytes());
        FileStorageServiceImp service = new FileStorageServiceImp(uploadDir.toString());

        List<String> urls = service.store(List.of(file));

        assertEquals(1, urls.size());
        assertTrue(urls.get(0).startsWith("/uploads/rooms/"));
        assertTrue(Files.exists(uploadDir.resolve("rooms").resolve(urls.get(0).substring("/uploads/rooms/".length()))));
    }

    private byte[] pngBytes() {
        return new byte[] { (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0 };
    }
}
