package com.roomates.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    List<String> store(List<MultipartFile> files);

    StoredObject read(String url);

    void delete(String url);

    record StoredObject(byte[] content, String contentType) {
    }
}
