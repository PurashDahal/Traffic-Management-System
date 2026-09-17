package com.traffic.system.config;

import com.traffic.system.entity.User;
import com.traffic.system.entity.Vehicle;
import com.traffic.system.entity.ViolationType;
import com.traffic.system.enums.RoleName;
import com.traffic.system.repository.UserRepository;
import com.traffic.system.repository.VehicleRepository;
import com.traffic.system.repository.ViolationTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ViolationTypeRepository violationTypeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Bootstrap Default Admin Account if missing
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .fullName("System Administrator")
                    .username("admin")
                    .email("admin@trafficsystem.gov.np")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("9800000000")
                    .citizenshipNo("ADM-001-2026")
                    .drivingLicenseNo("ADM-LIC-001")
                    .role(RoleName.ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
            System.out.println("=== INITIALIZED DEFAULT ADMIN USER: admin / admin123 ===");
        }

        // Bootstrap Default Officer Account if missing
        if (!userRepository.existsByUsername("officer1")) {
            User officer = User.builder()
                    .fullName("Inspector Ram Sharma")
                    .username("officer1")
                    .email("officer1@trafficsystem.gov.np")
                    .password(passwordEncoder.encode("officer123"))
                    .phone("9841000001")
                    .citizenshipNo("OFF-101-2026")
                    .drivingLicenseNo("OFF-LIC-101")
                    .role(RoleName.TRAFFIC_OFFICER)
                    .active(true)
                    .build();
            userRepository.save(officer);
            System.out.println("=== INITIALIZED DEFAULT OFFICER USER: officer1 / officer123 ===");
        }

        // Bootstrap Default Vehicle Owner Account if missing
        User citizen = userRepository.findByUsername("citizen1").orElse(null);
        if (citizen == null) {
            citizen = User.builder()
                    .fullName("Hari Bahadur Shrestha")
                    .username("citizen1")
                    .email("citizen1@gmail.com")
                    .password(passwordEncoder.encode("citizen123"))
                    .phone("9851000002")
                    .citizenshipNo("CTZ-202-2026")
                    .drivingLicenseNo("CTZ-LIC-202")
                    .role(RoleName.VEHICLE_OWNER)
                    .active(true)
                    .build();
            citizen = userRepository.save(citizen);
            System.out.println("=== INITIALIZED DEFAULT CITIZEN USER: citizen1 / citizen123 ===");
        }

        // Bootstrap Sample Vehicles if missing
        if (vehicleRepository.count() == 0) {
            List<Vehicle> defaultVehicles = Arrays.asList(
                    Vehicle.builder().owner(citizen).vehicleNumber("BA-1-PA-1234").vehicleType("Motorcycle").model("Bajaj Pulsar 220").bluebookNumber("BB-1001").build(),
                    Vehicle.builder().owner(citizen).vehicleNumber("BA-2-CHA-5678").vehicleType("Car").model("Hyundai i20").bluebookNumber("BB-1002").build(),
                    Vehicle.builder().owner(citizen).vehicleNumber("LU-1-KHA-9999").vehicleType("Bus").model("Ashok Leyland").bluebookNumber("BB-1003").build()
            );
            vehicleRepository.saveAll(defaultVehicles);
            System.out.println("=== INITIALIZED DEFAULT SAMPLE VEHICLES: BA-1-PA-1234, BA-2-CHA-5678, LU-1-KHA-9999 ===");
        }

        // Bootstrap Standard Violation Types if empty
        if (violationTypeRepository.count() == 0) {
            List<ViolationType> defaultTypes = Arrays.asList(
                    ViolationType.builder().categoryName("Speeding").description("Exceeding speed limit on designated road").defaultFineAmount(new BigDecimal("1500.00")).active(true).build(),
                    ViolationType.builder().categoryName("Red-light violation").description("Vehicle crossed intersection after red light signal").defaultFineAmount(new BigDecimal("1000.00")).active(true).build(),
                    ViolationType.builder().categoryName("No helmet").description("Rider operating motorcycle without protective helmet").defaultFineAmount(new BigDecimal("500.00")).active(true).build(),
                    ViolationType.builder().categoryName("No seat belt").description("Driver operating vehicle without seat belt").defaultFineAmount(new BigDecimal("500.00")).active(true).build(),
                    ViolationType.builder().categoryName("Wrong-side driving").description("Driving vehicle against traffic flow direction").defaultFineAmount(new BigDecimal("1000.00")).active(true).build(),
                    ViolationType.builder().categoryName("Illegal parking").description("Vehicle parked in no-parking zone or blocking traffic").defaultFineAmount(new BigDecimal("500.00")).active(true).build(),
                    ViolationType.builder().categoryName("Driving without license").description("Operating vehicle without valid driving license").defaultFineAmount(new BigDecimal("2000.00")).active(true).build(),
                    ViolationType.builder().categoryName("Driving without vehicle registration").description("Operating unregistered vehicle").defaultFineAmount(new BigDecimal("2000.00")).active(true).build(),
                    ViolationType.builder().categoryName("Mobile phone use while driving").description("Actively using mobile phone while driving").defaultFineAmount(new BigDecimal("1000.00")).active(true).build(),
                    ViolationType.builder().categoryName("Drunk driving").description("Operating vehicle under influence of alcohol").defaultFineAmount(new BigDecimal("3000.00")).active(true).build(),
                    ViolationType.builder().categoryName("Overloading").description("Carrying passengers or freight exceeding vehicle capacity").defaultFineAmount(new BigDecimal("1500.00")).active(true).build(),
                    ViolationType.builder().categoryName("Other").description("General traffic rule violation").defaultFineAmount(new BigDecimal("500.00")).active(true).build()
            );
            violationTypeRepository.saveAll(defaultTypes);
            System.out.println("=== INITIALIZED DEFAULT VIOLATION TYPES ===");
        }
    }
}
