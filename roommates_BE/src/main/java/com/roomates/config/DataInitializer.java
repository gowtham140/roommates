package com.roomates.config;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.roomates.model.Room;
import com.roomates.model.User;
import com.roomates.repository.RoomRepository;
import com.roomates.repository.UserRepository;
import com.roomates.security.UserTypes;

@Component
@Profile({ "dev", "local" })
public class DataInitializer implements CommandLineRunner {

    private static final String DEMO_EMAIL = "demo@roommates.local";
    private static final String DEMO_SEEKER_EMAIL = "seeker@roommates.local";
    private static final String ADMIN_EMAIL = "admin@roommates.local";

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, RoomRepository roomRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        User admin = userRepository.findByMailID(ADMIN_EMAIL);
        if (admin == null) {
            admin = new User();
            admin.setName("Admin");
            admin.setMailID(ADMIN_EMAIL);
            admin.setPhone_no("9000000001");
            admin.setPassword(passwordEncoder.encode("admin1234"));
            admin.setGender("ANY");
            admin.setUserType(UserTypes.ADMIN);
            admin.setStatus(true);
            admin.setIsDelete(false);
            admin.setCreatedDate(new Date());
            admin.setUpdatedDate(new Date());
            userRepository.save(admin);
        }

        User owner = userRepository.findByMailID(DEMO_EMAIL);
        if (owner == null) {
            owner = new User();
            owner.setName("Demo Owner");
            owner.setMailID(DEMO_EMAIL);
            owner.setPhone_no("9000000000");
            owner.setPassword(passwordEncoder.encode("demo1234"));
            owner.setGender("ANY");
            owner.setUserType(UserTypes.OWNER);
            owner.setStatus(true);
            owner.setIsDelete(false);
            owner.setCreatedDate(new Date());
            owner.setUpdatedDate(new Date());
            owner = userRepository.save(owner);
        }

        User seeker = userRepository.findByMailID(DEMO_SEEKER_EMAIL);
        if (seeker == null) {
            seeker = new User();
            seeker.setName("Demo Seeker");
            seeker.setMailID(DEMO_SEEKER_EMAIL);
            seeker.setPhone_no("9000000002");
            seeker.setPassword(passwordEncoder.encode("seeker1234"));
            seeker.setGender("ANY");
            seeker.setUserType(UserTypes.SEEKER);
            seeker.setStatus(true);
            seeker.setIsDelete(false);
            seeker.setCreatedDate(new Date());
            seeker.setUpdatedDate(new Date());
            userRepository.save(seeker);
        }

        ensureCoordinates("Velachery", 12.9759, 80.2209);
        ensureCoordinates("Adyar", 13.0012, 80.2565);
        ensureCoordinates("OMR", 12.9352, 80.2370);

        if (roomRepository.count() > 0) {
            return;
        }

        roomRepository.save(room(owner, "Cozy 1BHK near metro", "Velachery", "1BHK", "Double", "ANY",
                "18000", "36000", List.of("WiFi", "AC", "Fridge", "Parking"), 12.9759, 80.2209));
        roomRepository.save(room(owner, "Spacious 2BHK with balcony", "Adyar", "2BHK", "Single", "FEMALE",
                "28000", "56000", List.of("WiFi", "AC", "Washing Machine", "Balcony"), 13.0012, 80.2565));
        roomRepository.save(room(owner, "Budget room in shared flat", "OMR", "1RK", "Triple", "ANY",
                "9500", "19000", List.of("WiFi", "TV", "Parking"), 12.9352, 80.2370));
    }

    private void ensureCoordinates(String location, double latitude, double longitude) {
        roomRepository.findByLocationIgnoreCase(location).stream()
                .filter(room -> room.getLatitude() == null || room.getLongitude() == null)
                .forEach(room -> {
                    room.setLatitude(latitude);
                    room.setLongitude(longitude);
                    roomRepository.save(room);
                });
    }

    private Room room(User owner, String title, String location, String type, String sharing, String gender,
            String rent, String deposit, List<String> amenities, Double latitude, Double longitude) {
        Room room = new Room();
        room.setOwner(owner);
        room.setTitle(title);
        room.setDescription("Comfortable, well-maintained room with good connectivity and friendly flatmates.");
        room.setLocation(location);
        room.setRoomType(type);
        room.setSharing(sharing);
        room.setGender(gender);
        room.setFood(true);
        room.setAvailableFrom(LocalDate.now().plusDays(7));
        room.setRent(new BigDecimal(rent));
        room.setDeposit(new BigDecimal(deposit));
        room.setStatus("ACTIVE");
        room.setIsDelete(false);
        room.setLatitude(latitude);
        room.setLongitude(longitude);
        room.setAmenities(Set.copyOf(amenities));
        return room;
    }
}
