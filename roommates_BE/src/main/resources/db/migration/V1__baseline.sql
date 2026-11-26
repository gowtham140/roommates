CREATE TABLE users_tb (
    id INT NOT NULL AUTO_INCREMENT,
    mailID VARCHAR(255) NOT NULL,
    userType VARCHAR(255),
    phone_no VARCHAR(255),
    name VARCHAR(255),
    isDelete BIT(1),
    password VARCHAR(255),
    status BIT(1),
    gender VARCHAR(255),
    age INT,
    working_details TEXT,
    hobby_preferences TEXT,
    seeking_closed BIT(1),
    createdDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (mailID)
) ENGINE=InnoDB;

CREATE TABLE rooms_tb (
    id INT NOT NULL AUTO_INCREMENT,
    owner_id INT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    rent DECIMAL(38,2),
    deposit DECIMAL(38,2),
    room_type VARCHAR(255),
    sharing VARCHAR(255),
    gender VARCHAR(255),
    food BIT(1),
    food_preference VARCHAR(255),
    available_from DATE,
    status VARCHAR(255),
    isDelete BIT(1),
    latitude DOUBLE,
    longitude DOUBLE,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_rooms_owner FOREIGN KEY (owner_id) REFERENCES users_tb (id)
) ENGINE=InnoDB;

CREATE TABLE room_amenities (
    room_id INT NOT NULL,
    amenity VARCHAR(255),
    PRIMARY KEY (room_id, amenity),
    CONSTRAINT fk_room_amenities_room FOREIGN KEY (room_id) REFERENCES rooms_tb (id)
) ENGINE=InnoDB;

CREATE TABLE room_images (
    room_id INT NOT NULL,
    image_url VARCHAR(255),
    PRIMARY KEY (room_id, image_url),
    CONSTRAINT fk_room_images_room FOREIGN KEY (room_id) REFERENCES rooms_tb (id)
) ENGINE=InnoDB;

CREATE TABLE email_otps_tb (
    id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    attempts INT NOT NULL,
    created_at DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT uk_email_otp_purpose UNIQUE (email, purpose)
) ENGINE=InnoDB;

CREATE TABLE enquiries_tb (
    id INT NOT NULL AUTO_INCREMENT,
    room_id INT NOT NULL,
    seeker_id INT NOT NULL,
    message TEXT,
    status VARCHAR(255),
    created_at DATETIME(6),
    updated_at DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_enquiries_room FOREIGN KEY (room_id) REFERENCES rooms_tb (id),
    CONSTRAINT fk_enquiries_seeker FOREIGN KEY (seeker_id) REFERENCES users_tb (id)
) ENGINE=InnoDB;

CREATE TABLE reports_tb (
    id INT NOT NULL AUTO_INCREMENT,
    reporter_id INT NOT NULL,
    reason VARCHAR(255),
    details TEXT,
    status VARCHAR(255),
    created_at DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users_tb (id)
) ENGINE=InnoDB;
