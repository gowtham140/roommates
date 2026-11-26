package com.roomates;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import com.roomates.exception.BadRequestException;
import com.roomates.exception.ResourceNotFoundException;
import com.roomates.serviceImp.FileStorageServiceImp;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@ExtendWith(MockitoExtension.class)
class FileStorageServiceImpTest {

    @Mock
    private S3Client s3Client;

    private FileStorageServiceImp service;

    @BeforeEach
    void setUp() {
        service = new FileStorageServiceImp(s3Client, "test-bucket");
    }

    @Test
    void deleteRemovesUploadedImageFromBucket() {
        service.delete("/uploads/rooms/a.png");

        ArgumentCaptor<DeleteObjectRequest> captor = ArgumentCaptor.forClass(DeleteObjectRequest.class);
        verify(s3Client).deleteObject(captor.capture());
        assertEquals("test-bucket", captor.getValue().bucket());
        assertEquals("rooms/a.png", captor.getValue().key());
    }

    @Test
    void deleteIgnoresPathsOutsideRoomAssets() {
        service.delete("/uploads/rooms/..");

        verifyNoInteractions(s3Client);
    }

    @Test
    void storeRejectsFilesWithoutImageMagicBytes() {
        MockMultipartFile file = new MockMultipartFile("files", "fake.png", "image/png",
                "not really a png".getBytes());

        assertThrows(BadRequestException.class, () -> service.store(List.of(file)));
        verify(s3Client, never()).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void storeValidatesEveryFileBeforeWritingAnything() {
        MockMultipartFile valid = new MockMultipartFile("files", "a.png", "image/png", pngBytes());
        MockMultipartFile invalid = new MockMultipartFile("files", "b.png", "image/png", "bad".getBytes());

        assertThrows(BadRequestException.class, () -> service.store(List.of(valid, invalid)));
        verifyNoInteractions(s3Client);
    }

    @Test
    void storeCleansUpObjectsWrittenBeforeAFailure() throws Exception {
        MockMultipartFile valid = new MockMultipartFile("files", "a.png", "image/png", pngBytes());
        MultipartFile failing = mock(MultipartFile.class);
        when(failing.isEmpty()).thenReturn(false);
        when(failing.getSize()).thenReturn(12L);
        when(failing.getContentType()).thenReturn("image/png");
        when(failing.getOriginalFilename()).thenReturn("b.png");
        when(failing.getInputStream())
                .thenReturn(new ByteArrayInputStream(pngBytes()))
                .thenThrow(new IOException("cannot read on write"));

        assertThrows(IllegalStateException.class, () -> service.store(List.of(valid, failing)));

        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
        ArgumentCaptor<DeleteObjectRequest> captor = ArgumentCaptor.forClass(DeleteObjectRequest.class);
        verify(s3Client).deleteObject(captor.capture());
        assertTrue(captor.getValue().key().startsWith("rooms/"));
    }

    @Test
    void storeAcceptsFileWithMatchingImageMagicBytes() {
        MockMultipartFile file = new MockMultipartFile("files", "a.png", "image/png", pngBytes());

        List<String> urls = service.store(List.of(file));

        assertEquals(1, urls.size());
        assertTrue(urls.get(0).startsWith("/uploads/rooms/"));
        ArgumentCaptor<PutObjectRequest> captor = ArgumentCaptor.forClass(PutObjectRequest.class);
        verify(s3Client).putObject(captor.capture(), any(RequestBody.class));
        assertEquals("test-bucket", captor.getValue().bucket());
        assertTrue(captor.getValue().key().startsWith("rooms/"));
        assertTrue(captor.getValue().key().endsWith(".png"));
        assertEquals("image/png", captor.getValue().contentType());
    }

    @Test
    void readMissingObjectThrowsNotFound() {
        when(s3Client.getObject(any(GetObjectRequest.class)))
                .thenThrow(NoSuchKeyException.builder().message("missing").build());

        assertThrows(ResourceNotFoundException.class, () -> service.read("/uploads/rooms/missing.png"));
    }

    private byte[] pngBytes() {
        return new byte[] { (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0 };
    }
}
